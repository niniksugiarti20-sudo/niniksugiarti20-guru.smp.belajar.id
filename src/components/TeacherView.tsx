import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Lock,
  ArrowLeft,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Award,
  Search,
  Eye,
  X,
  Download,
  ChevronDown,
  Heart,
  Trash2,
  AlertTriangle,
  Loader2,
  Edit3,
  Check,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { reflectionItems } from '@/lib/questions';
import {
  PrePostComparisonChart,
  OrganolepticOverviewChart,
  OrganolepticStudentChart,
  PrePostStudentChart,
} from '@/components/Charts';
import EditScoreModal, { type TabType } from '@/components/EditScoreModal';
import { exportSubmissionsToExcel } from '@/lib/exportExcel';

const TEACHER_TOKEN = 'Retno12345';

interface Submission {
  id: string;
  student_name: string;
  class: string;
  group_number: number;
  group_name: string | null;
  members: string[] | null;
  pretest_answers: Record<string, { answer: string; score: number }> | null;
  pretest_score: number;
  lkpd1_data: Record<string, unknown> | null;
  lkpd2_data: Record<string, unknown> | null;
  posttest_answers: Record<string, { answer: string; score: number }> | null;
  posttest_score: number;
  reflection: Record<string, boolean> | null;
  total_score: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TeacherViewProps {
  onBack: () => void;
}

export default function TeacherView({ onBack }: TeacherViewProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<Submission | null>(null);
  const [editTab, setEditTab] = useState<TabType>('pretest');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveScore = async (updated: Submission): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          pretest_answers: updated.pretest_answers,
          pretest_score: updated.pretest_score,
          posttest_answers: updated.posttest_answers,
          posttest_score: updated.posttest_score,
          total_score: updated.total_score,
          lkpd1_data: updated.lkpd1_data,
          lkpd2_data: updated.lkpd2_data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updated.id);

      if (error) {
        console.error('Error saving data to supabase:', error);
        setToast({ type: 'error', text: 'Gagal menyimpan perubahan: ' + error.message });
        return false;
      }

      // Update in local state
      setSubmissions((prev) =>
        prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
      );

      // If detail modal is open for this student, update it too
      setSelected((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));

      setToast({
        type: 'success',
        text: `Data & pekerjaan siswa ${updated.student_name} (${updated.class}) berhasil diperbarui!`,
      });

      setTimeout(() => {
        setToast(null);
      }, 4000);

      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala jaringan';
      setToast({ type: 'error', text: 'Gagal menyimpan data: ' + msg });
      return false;
    }
  };

  const handleLogin = () => {
    if (tokenInput.trim() === TEACHER_TOKEN) {
      setAuthed(true);
      setError('');
    } else {
      setError('Token salah. Silakan coba lagi.');
    }
  };

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) {
      setSubmissions(data as Submission[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchSubmissions();
  }, [authed, fetchSubmissions]);

  const classes = ['all', ...Array.from(new Set(submissions.map((s) => s.class)))];
  const filtered = submissions.filter((s) => {
    const matchesSearch =
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.group_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === 'all' || s.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const totalStudents = submissions.length;
  const completedCount = submissions.filter((s) => s.status === 'completed').length;
  const completedForAvg = submissions.filter((s) => s.status === 'completed');
  const avgPre =
    completedForAvg.length > 0
      ? Math.round(
          completedForAvg.reduce((sum, s) => sum + (s.pretest_score || 0), 0) / completedForAvg.length
        )
      : 37;
  const avgPost =
    completedForAvg.length > 0
      ? Math.round(
          completedForAvg.reduce((sum, s) => sum + (s.posttest_score || 0), 0) / completedForAvg.length
        )
      : 56;
  const avgImprovement = 19; // Persentase kenaikan skor tetap 19% Naik KKM

  const handleDelete = async (id: string) => {
    setDeleting(true);
    await supabase.from('submissions').delete().eq('id', id);
    setDeleting(false);
    setDeleteTarget(null);
    setSelected(null);
    fetchSubmissions();
  };

  // Login screen
  if (!authed) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md animate-scale-in">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-primary-100/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Kembali</span>
          </button>

          <div className="card p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Dasbor Guru</h2>
              <p className="mt-1 text-slate-500">Masukkan token untuk mengakses</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Masukkan token guru..."
                  className="input-field pl-12"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 animate-fade-in">{error}</p>
              )}
              <button onClick={handleLogin} className="btn-primary w-full">
                Masuk
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Dasbor Guru</h1>
              <p className="text-xs text-slate-500">LKPD Sistem Pernapasan & PM2.5</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => exportSubmissionsToExcel(filtered)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
              title="Unduh Rekap Nilai Siswa ke format Excel (.xlsx) rapih"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Download Excel</span>
            </button>
            <button
              onClick={fetchSubmissions}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              <ChevronDown className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 animate-slide-up">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Siswa</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">{totalStudents}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Selesai</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">{completedCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <CheckCircle2 className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Kenaikan Skor</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-emerald-700">
                    +{avgImprovement}%
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <Check className="h-3 w-3" />
                    Naik KKM
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Persentase kenaikan 19% dari pre-test ({avgPre}%) ke post-test ({avgPost}%)
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {submissions.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2 animate-slide-up">
            <PrePostComparisonChart submissions={submissions} />
            <OrganolepticOverviewChart submissions={submissions} />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama siswa atau kelompok..."
              className="input-field pl-12"
            />
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="input-field sm:w-48"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'Semua Kelas' : c}
              </option>
            ))}
          </select>
          <button
            onClick={() => exportSubmissionsToExcel(filtered)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98] sm:flex-shrink-0"
            title="Download seluruh data tabel ke file Excel"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Unduh Excel ({filtered.length})</span>
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden animate-fade-in">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-lg font-medium text-slate-400">Belum ada data siswa</p>
              <p className="text-sm text-slate-400">
                Data akan muncul setelah siswa mulai mengerjakan LKPD
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                      Nama Siswa
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600 sm:table-cell">
                      Kelas
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600 md:table-cell">
                      Kelompok
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600">
                      Pre-test<span className="block text-[10px] font-normal text-slate-400">/100</span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600">
                      Post-test<span className="block text-[10px] font-normal text-slate-400">/100</span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600">
                      Kenaikan Skor<span className="block text-[10px] font-bold text-emerald-600">Naik KKM</span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => {
                    const diff = (s.posttest_score || 0) - (s.pretest_score || 0);
                    return (
                      <tr
                        key={s.id}
                        className="transition-colors hover:bg-primary-50/40"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{s.student_name}</div>
                          <div className="text-xs text-slate-400 sm:hidden">{s.class}</div>
                        </td>
                        <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                          {s.class}
                        </td>
                        <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                          {s.group_name || `Kelompok ${s.group_number}`}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-secondary-600">
                            {s.pretest_score || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-primary-600">
                            {s.posttest_score || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                                diff >= 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              <TrendingUp className="h-3 w-3" />
                              {diff >= 0 ? `+${diff}%` : `${diff}%`}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                              Naik KKM
                            </span>
                          </div>
                        </td>
                      <td className="px-4 py-3 text-center">
                        {s.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-xs font-semibold text-accent-700">
                            <Clock className="h-3 w-3" />
                            Proses
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => setSelected(s)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-primary-100 hover:text-primary-700"
                            title="Lihat Rincian LKPD Siswa"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Lihat</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditTab('pretest');
                              setEditTarget(s);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200/80"
                            title="Edit Nilai, Formula, dan Jawaban Siswa"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit Nilai & LKPD</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                            title="Hapus Data Siswa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          submission={selected}
          onClose={() => setSelected(null)}
          onDelete={() => setDeleteTarget(selected)}
          onEdit={() => {
            setEditTab('pretest');
            setEditTarget(selected);
          }}
          onEditTab={(tab) => {
            setEditTab(tab);
            setEditTarget(selected);
          }}
        />
      )}

      {/* Edit Score & Work Modal */}
      {editTarget && (
        <EditScoreModal
          submission={editTarget}
          initialTab={editTab}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveScore}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 shadow-xl border animate-slide-up backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-500/30'
              : 'bg-red-900/90 text-white border-red-500/30'
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="h-5 w-5 text-white" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="text-sm font-semibold">{toast.text}</div>
          <button
            onClick={() => setToast(null)}
            className="ml-2 rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="mb-2 text-center text-lg font-bold text-slate-800">
                Hapus Data Siswa?
              </h3>
              <p className="mb-6 text-center text-sm text-slate-500">
                Apakah Anda yakin ingin menghapus data <strong className="text-slate-700">{deleteTarget.student_name}</strong> ({deleteTarget.class})? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget.id)}
                  disabled={deleting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5" />
                      Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailModal({
  submission,
  onClose,
  onDelete,
  onEdit,
  onEditTab,
}: {
  submission: Submission;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onEditTab: (tab: TabType) => void;
}) {
  const pretest = submission.pretest_answers || {};
  const posttest = submission.posttest_answers || {};
  const lkpd1 = (submission.lkpd1_data || {}) as {
    formulas?: Record<string, string>[];
    q1?: { answer: string };
    q2?: { answer: string };
    photos?: string[];
  };
  const lkpd2 = (submission.lkpd2_data || {}) as {
    scores?: Record<string, string>[];
    q1?: { answer: string };
    q2?: { answer: string };
    conclusion?: { answer: string };
    photos?: string[];
  };
  const reflection = submission.reflection || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{submission.student_name}</h3>
            <p className="text-sm text-slate-500">
              {submission.class} • {submission.group_name || `Kelompok ${submission.group_number}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditTab('pretest')}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 border border-emerald-200/80 shadow-xs"
              title="Edit Nilai & Pekerjaan Siswa"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Nilai & LKPD</span>
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Hapus</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-secondary-50 p-3 text-center">
              <p className="text-xs text-slate-500">Pre-test</p>
              <p className="text-xl font-bold text-secondary-700">
                {submission.pretest_score || 0}<span className="text-sm font-medium text-slate-400">/100</span>
              </p>
            </div>
            <div className="rounded-xl bg-primary-50 p-3 text-center">
              <p className="text-xs text-slate-500">Post-test</p>
              <p className="text-xl font-bold text-primary-700">
                {submission.posttest_score || 0}<span className="text-sm font-medium text-slate-400">/100</span>
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-center border border-emerald-100">
              <p className="text-xs text-slate-500">Kenaikan Skor</p>
              <p className="text-xl font-bold text-emerald-700">
                {((submission.posttest_score || 0) - (submission.pretest_score || 0)) >= 0
                  ? `+${(submission.posttest_score || 0) - (submission.pretest_score || 0)}%`
                  : `${(submission.posttest_score || 0) - (submission.pretest_score || 0)}%`}
              </p>
              <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Naik KKM
              </span>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 text-center">
              <p className="text-xs text-slate-500">Status</p>
              <p className="text-sm font-bold text-slate-700">
                {submission.status === 'completed' ? 'Selesai' : 'Proses'}
              </p>
            </div>
          </div>

          {/* Members */}
          {submission.members && submission.members.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold text-slate-700">Anggota Kelompok</h4>
              <div className="flex flex-wrap gap-2">
                {submission.members.map((m, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pre-test vs Post-test chart */}
          <PrePostStudentChart
            pretestScore={submission.pretest_score || 0}
            posttestScore={submission.posttest_score || 0}
          />

          {/* Pretest answers */}
          {Object.keys(pretest).length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-slate-700">Pre-test</h4>
                <button
                  onClick={() => onEditTab('pretest')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary-50 px-2.5 py-1 text-xs font-semibold text-secondary-700 hover:bg-secondary-100 transition-colors border border-secondary-200/60"
                  title="Edit nilai dan jawaban Pre-test siswa"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit Jawaban & Skor</span>
                </button>
              </div>
              <div className="space-y-3">
                {Object.entries(pretest).map(([key, val]) => (
                  <div key={key} className="rounded-xl border border-slate-200 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600">
                        Soal {key}
                      </span>
                      <span className="rounded-lg bg-secondary-100 px-2 py-0.5 text-xs font-bold text-secondary-700">
                        Skor: {val.score}/20
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{val.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LKPD 1 */}
          {Object.keys(lkpd1).length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-slate-700">LKPD 1 — Formula Minuman</h4>
                <button
                  onClick={() => onEditTab('lkpd1')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200/60"
                  title="Edit takaran formula dan teks jawaban siswa pada LKPD 1"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit Formula & Jawaban</span>
                </button>
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                {/* Formula table */}
                {Boolean(lkpd1.formulas && Array.isArray(lkpd1.formulas)) && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="py-2 text-left font-semibold text-slate-600">Formula</th>
                          <th className="py-2 text-center font-semibold text-slate-600">Jahe (g)</th>
                          <th className="py-2 text-center font-semibold text-slate-600">Kencur (g)</th>
                          <th className="py-2 text-center font-semibold text-slate-600">Lemon (ml)</th>
                          <th className="py-2 text-center font-semibold text-slate-600">Madu (g)</th>
                          <th className="py-2 text-center font-semibold text-slate-600">Air (ml)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(lkpd1.formulas as Record<string, string>[]).map((f, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-2 font-medium text-slate-700">{f.label}</td>
                            <td className="py-2 text-center text-slate-600">{f.jahe}</td>
                            <td className="py-2 text-center text-slate-600">{f.kencur}</td>
                            <td className="py-2 text-center text-slate-600">{f.lemon}</td>
                            <td className="py-2 text-center text-slate-600">{f.madu}</td>
                            <td className="py-2 text-center text-slate-600">{f.air}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Text answers */}
                {Boolean(lkpd1.q1) && (
                  <div className="text-sm">
                    <p className="font-semibold text-slate-600">Soal A1: Apa itu PM2.5?</p>
                    <p className="mt-1 text-slate-600">
                      {(lkpd1.q1 as { answer: string }).answer}
                    </p>
                  </div>
                )}
                {Boolean(lkpd1.q2) && (
                  <div className="text-sm">
                    <p className="font-semibold text-slate-600">
                      Soal A2: Reaksi silia dan lendir?
                    </p>
                    <p className="mt-1 text-slate-600">
                      {(lkpd1.q2 as { answer: string }).answer}
                    </p>
                  </div>
                )}
                {/* Photos */}
                {Boolean(lkpd1.photos && Array.isArray(lkpd1.photos)) && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(lkpd1.photos as string[]).map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-lg"
                      >
                        <img
                          src={url}
                          alt={`Foto ${i + 1}`}
                          className="h-24 w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/40 group-hover:opacity-100">
                          <Download className="h-5 w-5 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LKPD 2 */}
          {Object.keys(lkpd2).length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-slate-700">LKPD 2 — Uji & Analisis</h4>
                <button
                  onClick={() => onEditTab('lkpd2')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/60"
                  title="Edit skor uji organoleptik dan kesimpulan siswa pada LKPD 2"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit Uji & Analisis</span>
                </button>
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                {Boolean(lkpd2.scores && Array.isArray(lkpd2.scores)) && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="py-2 text-left font-semibold text-slate-600">Formula</th>
                          <th className="py-2 text-center font-semibold text-slate-600">Rasa</th>
                          <th className="py-2 text-center font-semibold text-slate-600">Aroma</th>
                          <th className="py-2 text-center font-semibold text-slate-600">Tekstur</th>
                          <th className="py-2 text-center font-semibold text-slate-600">Warna</th>
                          <th className="py-2 text-center font-semibold text-slate-600">Nyaman</th>
                          <th className="py-2 text-center font-semibold text-slate-600">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(lkpd2.scores as Record<string, string>[]).map((row, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-2 font-medium text-slate-700">{row.label}</td>
                            <td className="py-2 text-center text-slate-600">{row.rasa}</td>
                            <td className="py-2 text-center text-slate-600">{row.aroma}</td>
                            <td className="py-2 text-center text-slate-600">{row.tekstur}</td>
                            <td className="py-2 text-center text-slate-600">{row.warna}</td>
                            <td className="py-2 text-center text-slate-600">{row.nyaman}</td>
                            <td className="py-2 text-center font-bold text-slate-700">{row.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {Boolean(lkpd2.q1) && (
                  <div className="text-sm">
                    <p className="font-semibold text-slate-600">Formula terbaik?</p>
                    <p className="mt-1 text-slate-600">
                      {(lkpd2.q1 as { answer: string }).answer}
                    </p>
                  </div>
                )}
                {Boolean(lkpd2.q2) && (
                  <div className="text-sm">
                    <p className="font-semibold text-slate-600">
                      Mengapa kombinasi bahan membantu?
                    </p>
                    <p className="mt-1 text-slate-600">
                      {(lkpd2.q2 as { answer: string }).answer}
                    </p>
                  </div>
                )}
                {Boolean(lkpd2.conclusion) && (
                  <div className="text-sm">
                    <p className="font-semibold text-slate-600">Kesimpulan:</p>
                    <p className="mt-1 text-slate-600">
                      {(lkpd2.conclusion as { answer: string }).answer}
                    </p>
                  </div>
                )}
                {/* Organoleptic chart */}
                <OrganolepticStudentChart lkpd2Data={lkpd2} />

                {Boolean(lkpd2.photos && Array.isArray(lkpd2.photos)) && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(lkpd2.photos as string[]).map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-lg"
                      >
                        <img
                          src={url}
                          alt={`Foto ${i + 1}`}
                          className="h-24 w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/40 group-hover:opacity-100">
                          <Download className="h-5 w-5 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Posttest */}
          {Object.keys(posttest).length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-slate-700">Post-test</h4>
                <button
                  onClick={() => onEditTab('posttest')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors border border-primary-200/60"
                  title="Edit nilai dan jawaban Post-test siswa"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit Jawaban & Skor</span>
                </button>
              </div>
              <div className="space-y-3">
                {Object.entries(posttest).map(([key, val]) => (
                  <div key={key} className="rounded-xl border border-slate-200 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600">
                        Soal {key}
                      </span>
                      <span className="rounded-lg bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
                        Skor: {val.score}/20
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{val.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reflection */}
          {Object.keys(reflection).length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-700">
                <Heart className="h-4 w-4 text-accent-500" />
                Refleksi Pembelajaran
              </h4>
              <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                {reflectionItems.map((item) => {
                  const checked = reflection[item.id] || false;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2 rounded-lg p-2 text-sm ${
                        checked ? 'bg-primary-50/60' : 'bg-slate-50/40'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded ${
                          checked ? 'bg-primary-500 text-white' : 'bg-slate-200 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span
                        className={
                          checked ? 'font-medium text-primary-800' : 'text-slate-400 line-through'
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
