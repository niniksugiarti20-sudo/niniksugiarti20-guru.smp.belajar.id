import { useState, useMemo } from 'react';
import {
  X,
  Save,
  Edit3,
  Award,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sliders,
  RotateCcw,
  FlaskConical,
  Beaker,
  FileText,
  TrendingUp,
} from 'lucide-react';
import {
  pretestQuestions,
  posttestQuestions,
  type EssayQuestion,
} from '@/lib/questions';

export interface Submission {
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

export type TabType = 'pretest' | 'posttest' | 'lkpd1' | 'lkpd2' | 'quick';

interface EditScoreModalProps {
  submission: Submission;
  initialTab?: TabType;
  onClose: () => void;
  onSave: (updated: Submission) => Promise<boolean>;
}

export default function EditScoreModal({
  submission,
  initialTab = 'pretest',
  onClose,
  onSave,
}: EditScoreModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Scores per question (1..5)
  const [preScores, setPreScores] = useState<Record<string, number>>(() => {
    const existing = submission.pretest_answers || {};
    const init: Record<string, number> = {};
    for (let i = 1; i <= 5; i++) {
      const key = String(i);
      init[key] = typeof existing[key]?.score === 'number' ? existing[key].score : 0;
    }
    return init;
  });

  const [postScores, setPostScores] = useState<Record<string, number>>(() => {
    const existing = submission.posttest_answers || {};
    const init: Record<string, number> = {};
    for (let i = 1; i <= 5; i++) {
      const key = String(i);
      init[key] = typeof existing[key]?.score === 'number' ? existing[key].score : 0;
    }
    return init;
  });

  // Student Answers text per question (1..5)
  const [preAnswers, setPreAnswers] = useState<Record<string, string>>(() => {
    const existing = submission.pretest_answers || {};
    const init: Record<string, string> = {};
    for (let i = 1; i <= 5; i++) {
      const key = String(i);
      init[key] = existing[key]?.answer || '';
    }
    return init;
  });

  const [postAnswers, setPostAnswers] = useState<Record<string, string>>(() => {
    const existing = submission.posttest_answers || {};
    const init: Record<string, string> = {};
    for (let i = 1; i <= 5; i++) {
      const key = String(i);
      init[key] = existing[key]?.answer || '';
    }
    return init;
  });

  // LKPD 1 Data state
  const [formulas, setFormulas] = useState<Array<Record<string, string>>>(() => {
    const lk1 = submission.lkpd1_data as { formulas?: Record<string, string>[] } | null;
    if (lk1?.formulas && Array.isArray(lk1.formulas)) {
      return JSON.parse(JSON.stringify(lk1.formulas));
    }
    return [
      { label: 'Formula 1', jahe: '10', kencur: '0', lemon: '10', madu: '10', air: '200' },
      { label: 'Formula 2', jahe: '15', kencur: '0', lemon: '10', madu: '10', air: '200' },
      { label: 'Formula 3', jahe: '10', kencur: '10', lemon: '10', madu: '10', air: '200' },
      { label: 'Formula Racikan Kelompok Kami', jahe: '10', kencur: '10', lemon: '10', madu: '10', air: '200' },
    ];
  });

  const [lkpd1Q1, setLkpd1Q1] = useState<string>(() => {
    const lk1 = submission.lkpd1_data as { q1?: { answer: string } } | null;
    return lk1?.q1?.answer || '';
  });

  const [lkpd1Q2, setLkpd1Q2] = useState<string>(() => {
    const lk1 = submission.lkpd1_data as { q2?: { answer: string } } | null;
    return lk1?.q2?.answer || '';
  });

  // LKPD 2 Data state
  const [organolepticScores, setOrganolepticScores] = useState<Array<Record<string, string>>>(() => {
    const lk2 = submission.lkpd2_data as { scores?: Record<string, string>[] } | null;
    if (lk2?.scores && Array.isArray(lk2.scores)) {
      return JSON.parse(JSON.stringify(lk2.scores));
    }
    return [
      { label: 'Formula 1', rasa: '3', aroma: '3', tekstur: '3', warna: '3', nyaman: '3', total: '15' },
      { label: 'Formula 2', rasa: '3', aroma: '3', tekstur: '3', warna: '3', nyaman: '3', total: '15' },
      { label: 'Formula 3', rasa: '4', aroma: '4', tekstur: '3', warna: '3', nyaman: '4', total: '18' },
      { label: 'Formula Terbaik Kelompok', rasa: '4', aroma: '4', tekstur: '4', warna: '4', nyaman: '4', total: '20' },
    ];
  });

  const [lkpd2Q1, setLkpd2Q1] = useState<string>(() => {
    const lk2 = submission.lkpd2_data as { q1?: { answer: string } } | null;
    return lk2?.q1?.answer || '';
  });

  const [lkpd2Q2, setLkpd2Q2] = useState<string>(() => {
    const lk2 = submission.lkpd2_data as { q2?: { answer: string } } | null;
    return lk2?.q2?.answer || '';
  });

  const [lkpd2Conclusion, setLkpd2Conclusion] = useState<string>(() => {
    const lk2 = submission.lkpd2_data as { conclusion?: { answer: string } } | null;
    return lk2?.conclusion?.answer || '';
  });

  // Direct override mode
  const [directPre, setDirectPre] = useState<number>(submission.pretest_score || 0);
  const [directPost, setDirectPost] = useState<number>(submission.posttest_score || 0);
  const [mode, setMode] = useState<'per-question' | 'direct'>('per-question');

  // Expanded rubrics state
  const [expandedRubrics, setExpandedRubrics] = useState<Record<string, boolean>>({});

  // Loading and error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculated totals
  const totalPre = useMemo(() => {
    if (mode === 'direct') return Math.min(100, Math.max(0, directPre));
    return Object.values(preScores).reduce((acc, curr) => acc + (curr || 0), 0);
  }, [preScores, directPre, mode]);

  const totalPost = useMemo(() => {
    if (mode === 'direct') return Math.min(100, Math.max(0, directPost));
    return Object.values(postScores).reduce((acc, curr) => acc + (curr || 0), 0);
  }, [postScores, directPost, mode]);

  const totalOverall = totalPre + totalPost;
  const scoreDiff = totalPost - totalPre;

  const toggleRubric = (key: string) => {
    setExpandedRubrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setQuestionScore = (
    type: 'pre' | 'post',
    key: string,
    rawVal: number
  ) => {
    const clamped = Math.min(20, Math.max(0, isNaN(rawVal) ? 0 : rawVal));
    if (type === 'pre') {
      setPreScores((prev) => ({ ...prev, [key]: clamped }));
    } else {
      setPostScores((prev) => ({ ...prev, [key]: clamped }));
    }
  };

  const handleFormulaChange = (index: number, field: string, value: string) => {
    setFormulas((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleOrganolepticChange = (index: number, field: string, value: string) => {
    setOrganolepticScores((prev) => {
      const copy = [...prev];
      const updatedRow = { ...copy[index], [field]: value };

      // Recalculate row total
      const r = parseInt(updatedRow.rasa) || 0;
      const a = parseInt(updatedRow.aroma) || 0;
      const t = parseInt(updatedRow.tekstur) || 0;
      const w = parseInt(updatedRow.warna) || 0;
      const n = parseInt(updatedRow.nyaman) || 0;
      updatedRow.total = String(r + a + t + w + n);

      copy[index] = updatedRow;
      return copy;
    });
  };

  const handleResetToOriginal = () => {
    const preExisting = submission.pretest_answers || {};
    const initPre: Record<string, number> = {};
    const initPreAns: Record<string, string> = {};
    for (let i = 1; i <= 5; i++) {
      const key = String(i);
      initPre[key] = typeof preExisting[key]?.score === 'number' ? preExisting[key].score : 0;
      initPreAns[key] = preExisting[key]?.answer || '';
    }
    setPreScores(initPre);
    setPreAnswers(initPreAns);

    const postExisting = submission.posttest_answers || {};
    const initPost: Record<string, number> = {};
    const initPostAns: Record<string, string> = {};
    for (let i = 1; i <= 5; i++) {
      const key = String(i);
      initPost[key] = typeof postExisting[key]?.score === 'number' ? postExisting[key].score : 0;
      initPostAns[key] = postExisting[key]?.answer || '';
    }
    setPostScores(initPost);
    setPostAnswers(initPostAns);

    const lk1 = submission.lkpd1_data as {
      formulas?: Record<string, string>[];
      q1?: { answer: string };
      q2?: { answer: string };
    } | null;
    if (lk1?.formulas) setFormulas(JSON.parse(JSON.stringify(lk1.formulas)));
    if (lk1?.q1) setLkpd1Q1(lk1.q1.answer);
    if (lk1?.q2) setLkpd1Q2(lk1.q2.answer);

    const lk2 = submission.lkpd2_data as {
      scores?: Record<string, string>[];
      q1?: { answer: string };
      q2?: { answer: string };
      conclusion?: { answer: string };
    } | null;
    if (lk2?.scores) setOrganolepticScores(JSON.parse(JSON.stringify(lk2.scores)));
    if (lk2?.q1) setLkpd2Q1(lk2.q1.answer);
    if (lk2?.q2) setLkpd2Q2(lk2.q2.answer);
    if (lk2?.conclusion) setLkpd2Conclusion(lk2.conclusion.answer);

    setDirectPre(submission.pretest_score || 0);
    setDirectPost(submission.posttest_score || 0);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let finalPreScore = totalPre;
      let finalPostScore = totalPost;
      let finalPreAnswers: Record<string, { answer: string; score: number }> = {};
      let finalPostAnswers: Record<string, { answer: string; score: number }> = {};

      if (mode === 'per-question') {
        for (let i = 1; i <= 5; i++) {
          const key = String(i);
          finalPreAnswers[key] = {
            answer: preAnswers[key] || '',
            score: Math.min(20, Math.max(0, preScores[key] || 0)),
          };
          finalPostAnswers[key] = {
            answer: postAnswers[key] || '',
            score: Math.min(20, Math.max(0, postScores[key] || 0)),
          };
        }
        finalPreScore = Object.values(finalPreAnswers).reduce((s, a) => s + a.score, 0);
        finalPostScore = Object.values(finalPostAnswers).reduce((s, a) => s + a.score, 0);
      } else {
        finalPreScore = Math.min(100, Math.max(0, directPre));
        finalPostScore = Math.min(100, Math.max(0, directPost));

        const prePerQ = Math.floor(finalPreScore / 5);
        const preRemainder = finalPreScore % 5;
        for (let i = 1; i <= 5; i++) {
          const key = String(i);
          finalPreAnswers[key] = {
            answer: preAnswers[key] || '',
            score: prePerQ + (i <= preRemainder ? 1 : 0),
          };
        }

        const postPerQ = Math.floor(finalPostScore / 5);
        const postRemainder = finalPostScore % 5;
        for (let i = 1; i <= 5; i++) {
          const key = String(i);
          finalPostAnswers[key] = {
            answer: postAnswers[key] || '',
            score: postPerQ + (i <= postRemainder ? 1 : 0),
          };
        }
      }

      const finalTotalScore = finalPreScore + finalPostScore;

      // Updated LKPD 1 data
      const updatedLkpd1 = {
        ...(submission.lkpd1_data || {}),
        formulas: formulas,
        q1: { answer: lkpd1Q1 },
        q2: { answer: lkpd1Q2 },
      };

      // Updated LKPD 2 data
      const updatedLkpd2 = {
        ...(submission.lkpd2_data || {}),
        scores: organolepticScores,
        q1: { answer: lkpd2Q1 },
        q2: { answer: lkpd2Q2 },
        conclusion: { answer: lkpd2Conclusion },
      };

      const updatedSubmission: Submission = {
        ...submission,
        pretest_answers: finalPreAnswers,
        pretest_score: finalPreScore,
        posttest_answers: finalPostAnswers,
        posttest_score: finalPostScore,
        total_score: finalTotalScore,
        lkpd1_data: updatedLkpd1,
        lkpd2_data: updatedLkpd2,
        updated_at: new Date().toISOString(),
      };

      const success = await onSave(updatedSubmission);
      if (success) {
        onClose();
      } else {
        setErrorMessage('Gagal memperbarui nilai dan jawaban siswa.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActiveRubricTier = (score: number) => {
    if (score >= 16) return '16-20';
    if (score >= 11) return '11-15';
    if (score >= 6) return '6-10';
    return '0-5';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-5 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="my-6 w-full max-w-4xl rounded-2xl bg-white shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
              <Edit3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">
                  Edit Hasil Pekerjaan & Nilai Siswa
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {submission.class}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                <strong className="text-slate-700">{submission.student_name}</strong> •{' '}
                {submission.group_name || `Kelompok ${submission.group_number}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToOriginal}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              title="Kembalikan ke data awal sebelum diedit"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Awal
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Live Score Summary Bar */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-emerald-50/40 to-sky-50/40 px-5 py-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-secondary-200 bg-white p-2.5 text-center shadow-xs">
              <p className="text-[11px] font-medium text-slate-500">Pre-test (Maks 100)</p>
              <p className="text-xl font-bold text-secondary-600">
                {totalPre}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </p>
            </div>
            <div className="rounded-xl border border-primary-200 bg-white p-2.5 text-center shadow-xs">
              <p className="text-[11px] font-medium text-slate-500">Post-test (Maks 100)</p>
              <p className="text-xl font-bold text-primary-600">
                {totalPost}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-2.5 text-center shadow-xs">
              <p className="text-[11px] font-medium text-slate-500">Kenaikan Skor</p>
              <p className="text-xl font-bold text-emerald-600">
                {scoreDiff >= 0 ? `+${scoreDiff}%` : `${scoreDiff}%`}
              </p>
              <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Naik KKM
              </span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-2.5 text-center shadow-xs">
              <p className="text-[11px] font-medium text-slate-500">Status KKM</p>
              <div className="flex items-center justify-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">
                  {totalPost >= 75 ? 'Tuntas (Di Atas KKM)' : 'Belum KKM'}
                </span>
              </div>
              <span className="mt-0.5 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                Rata-rata Kelas 19%
              </span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 animate-fade-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-slate-200 px-5 pt-3 gap-1">
          <button
            onClick={() => {
              setActiveTab('pretest');
              setMode('per-question');
            }}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'pretest' && mode === 'per-question'
                ? 'border-secondary-600 text-secondary-700 bg-secondary-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Pre-test</span>
            <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-bold text-secondary-700">
              {totalPre}/100
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('posttest');
              setMode('per-question');
            }}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'posttest' && mode === 'per-question'
                ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Post-test</span>
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
              {totalPost}/100
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('lkpd1');
              setMode('per-question');
            }}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'lkpd1'
                ? 'border-teal-600 text-teal-800 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FlaskConical className="h-4 w-4 text-teal-600" />
            <span>LKPD 1 (Formula & Jawaban)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('lkpd2');
              setMode('per-question');
            }}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'lkpd2'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Beaker className="h-4 w-4 text-emerald-600" />
            <span>LKPD 2 (Uji & Analisis)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('quick');
              setMode('direct');
              setDirectPre(totalPre);
              setDirectPost(totalPost);
            }}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-all ${
              mode === 'direct'
                ? 'border-slate-800 text-slate-800 bg-slate-100/70'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Ubah Total Langsung</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
          {mode === 'direct' ? (
            /* Quick direct score edit mode */
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  Mode Pengeditan Total Langsung
                </h4>
                <p className="mt-1 text-sm text-slate-600">
                  Tentukan langsung total skor Pre-test dan Post-test tanpa mengubah rincian per-soal satu per satu.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-secondary-200 bg-white p-5 shadow-xs">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-bold text-secondary-800">
                      Total Nilai Pre-test
                    </label>
                    <span className="text-xs text-slate-400">Skala 0 - 100</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={directPre}
                      onChange={(e) =>
                        setDirectPre(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))
                      }
                      className="input-field text-xl font-bold text-secondary-700"
                    />
                    <span className="text-base font-bold text-slate-400">/ 100</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[50, 56, 58, 60, 62, 64, 66, 70].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDirectPre(val)}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                          directPre === val
                            ? 'bg-secondary-600 text-white shadow-xs'
                            : 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-primary-200 bg-white p-5 shadow-xs">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-bold text-primary-800">
                      Total Nilai Post-test
                    </label>
                    <span className="text-xs text-slate-400">Skala 0 - 100</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={directPost}
                      onChange={(e) =>
                        setDirectPost(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))
                      }
                      className="input-field text-xl font-bold text-primary-700"
                    />
                    <span className="text-base font-bold text-slate-400">/ 100</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[75, 76, 78, 80, 82, 84, 85, 88, 90, 92].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDirectPost(val)}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                          directPost === val
                            ? 'bg-primary-600 text-white shadow-xs'
                            : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'lkpd1' ? (
            /* LKPD 1 Formula & Answers Editor */
            <div className="space-y-6">
              <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-teal-600" />
                  <h4 className="font-bold text-teal-900">
                    Edit Rancangan Formula Minuman Herbal Siswa
                  </h4>
                </div>
                <p className="mt-1 text-xs text-teal-700">
                  Bapak/Ibu Guru dapat menyunting takaran bahan (jahe, kencur, lemon, madu, air)
                  untuk setiap formula serta memperbaiki teks jawaban siswa di bawah ini.
                </p>
              </div>

              {/* Formulas Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <h5 className="mb-3 font-semibold text-slate-700 text-sm">Tabel Takaran Formula:</h5>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs">
                      <th className="py-2.5 px-3 text-left font-bold">Nama Formula</th>
                      <th className="py-2.5 px-3 text-center font-bold">Jahe (g)</th>
                      <th className="py-2.5 px-3 text-center font-bold">Kencur (g)</th>
                      <th className="py-2.5 px-3 text-center font-bold">Lemon (ml)</th>
                      <th className="py-2.5 px-3 text-center font-bold">Madu (g)</th>
                      <th className="py-2.5 px-3 text-center font-bold">Air (ml)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formulas.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {f.label}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="text"
                            value={f.jahe || ''}
                            onChange={(e) => handleFormulaChange(i, 'jahe', e.target.value)}
                            className="h-8 w-16 rounded-md border border-slate-200 text-center font-medium focus:border-teal-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="text"
                            value={f.kencur || ''}
                            onChange={(e) => handleFormulaChange(i, 'kencur', e.target.value)}
                            className="h-8 w-16 rounded-md border border-slate-200 text-center font-medium focus:border-teal-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="text"
                            value={f.lemon || ''}
                            onChange={(e) => handleFormulaChange(i, 'lemon', e.target.value)}
                            className="h-8 w-16 rounded-md border border-slate-200 text-center font-medium focus:border-teal-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="text"
                            value={f.madu || ''}
                            onChange={(e) => handleFormulaChange(i, 'madu', e.target.value)}
                            className="h-8 w-16 rounded-md border border-slate-200 text-center font-medium focus:border-teal-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="text"
                            value={f.air || ''}
                            onChange={(e) => handleFormulaChange(i, 'air', e.target.value)}
                            className="h-8 w-16 rounded-md border border-slate-200 text-center font-medium focus:border-teal-500 focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* LKPD 1 Answers */}
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <label className="block text-sm font-bold text-slate-800">
                    Soal A1: Apa itu PM2.5 dan mengapa berbahaya bagi saluran pernapasan?
                  </label>
                  <p className="mt-0.5 text-xs text-slate-400">Edit jawaban yang ditulis siswa:</p>
                  <textarea
                    rows={4}
                    value={lkpd1Q1}
                    onChange={(e) => setLkpd1Q1(e.target.value)}
                    placeholder="Masukkan jawaban siswa untuk Soal A1..."
                    className="mt-2 w-full rounded-lg border-2 border-slate-200 p-3 text-sm text-slate-700 leading-relaxed focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <label className="block text-sm font-bold text-slate-800">
                    Soal A2: Bagaimana reaksi silia dan lendir di tenggorokan ketika banyak partikel polusi terhirup?
                  </label>
                  <p className="mt-0.5 text-xs text-slate-400">Edit jawaban yang ditulis siswa:</p>
                  <textarea
                    rows={4}
                    value={lkpd1Q2}
                    onChange={(e) => setLkpd1Q2(e.target.value)}
                    placeholder="Masukkan jawaban siswa untuk Soal A2..."
                    className="mt-2 w-full rounded-lg border-2 border-slate-200 p-3 text-sm text-slate-700 leading-relaxed focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'lkpd2' ? (
            /* LKPD 2 Organoleptic & Analysis Editor */
            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                <div className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-emerald-600" />
                  <h4 className="font-bold text-emerald-900">
                    Edit Hasil Uji Organoleptik & Analisis LKPD 2 Siswa
                  </h4>
                </div>
                <p className="mt-1 text-xs text-emerald-700">
                  Bapak/Ibu Guru dapat menyunting nilai skor uji organoleptik (skala 1–4) serta mengedit
                  jawaban formula terbaik, alasan kombinasi bahan, dan kesimpulan akhir siswa.
                </p>
              </div>

              {/* Organoleptic Scores Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <h5 className="mb-3 font-semibold text-slate-700 text-sm">
                  Tabel Hasil Uji Organoleptik (Skor 1 - 4 per indikator):
                </h5>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs">
                      <th className="py-2.5 px-3 text-left font-bold">Formula</th>
                      <th className="py-2.5 px-2 text-center font-bold">Rasa</th>
                      <th className="py-2.5 px-2 text-center font-bold">Aroma</th>
                      <th className="py-2.5 px-2 text-center font-bold">Tekstur</th>
                      <th className="py-2.5 px-2 text-center font-bold">Warna</th>
                      <th className="py-2.5 px-2 text-center font-bold">Nyaman</th>
                      <th className="py-2.5 px-3 text-center font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {organolepticScores.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {row.label}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="text"
                            value={row.rasa || ''}
                            onChange={(e) => handleOrganolepticChange(i, 'rasa', e.target.value)}
                            className="h-8 w-14 rounded-md border border-slate-200 text-center font-medium focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="text"
                            value={row.aroma || ''}
                            onChange={(e) => handleOrganolepticChange(i, 'aroma', e.target.value)}
                            className="h-8 w-14 rounded-md border border-slate-200 text-center font-medium focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="text"
                            value={row.tekstur || ''}
                            onChange={(e) => handleOrganolepticChange(i, 'tekstur', e.target.value)}
                            className="h-8 w-14 rounded-md border border-slate-200 text-center font-medium focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="text"
                            value={row.warna || ''}
                            onChange={(e) => handleOrganolepticChange(i, 'warna', e.target.value)}
                            className="h-8 w-14 rounded-md border border-slate-200 text-center font-medium focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="text"
                            value={row.nyaman || ''}
                            onChange={(e) => handleOrganolepticChange(i, 'nyaman', e.target.value)}
                            className="h-8 w-14 rounded-md border border-slate-200 text-center font-medium focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-700">
                          {row.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* LKPD 2 Answers */}
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <label className="block text-sm font-bold text-slate-800">
                    Pertanyaan 1: Formula terbaik pilihan kelompok?
                  </label>
                  <input
                    type="text"
                    value={lkpd2Q1}
                    onChange={(e) => setLkpd2Q1(e.target.value)}
                    placeholder="Contoh: Formula 3 atau Formula Racikan Kelompok Kami..."
                    className="mt-2 w-full rounded-lg border-2 border-slate-200 p-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <label className="block text-sm font-bold text-slate-800">
                    Pertanyaan 2: Mengapa kombinasi bahan pada formula terpilih dapat membantu melegakan tenggorokan?
                  </label>
                  <textarea
                    rows={3}
                    value={lkpd2Q2}
                    onChange={(e) => setLkpd2Q2(e.target.value)}
                    placeholder="Masukkan penjelasan siswa..."
                    className="mt-2 w-full rounded-lg border-2 border-slate-200 p-3 text-sm text-slate-700 leading-relaxed focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <label className="block text-sm font-bold text-slate-800">
                    Kesimpulan Akhir LKPD 2:
                  </label>
                  <textarea
                    rows={4}
                    value={lkpd2Conclusion}
                    onChange={(e) => setLkpd2Conclusion(e.target.value)}
                    placeholder="Masukkan kesimpulan yang ditulis siswa..."
                    className="mt-2 w-full rounded-lg border-2 border-slate-200 p-3 text-sm text-slate-700 leading-relaxed focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Per-question detailed mode for Pre-test or Post-test */
            <div className="space-y-5">
              {(activeTab === 'pretest' ? pretestQuestions : posttestQuestions).map((q: EssayQuestion) => {
                const key = String(q.id);
                const currentScore =
                  activeTab === 'pretest' ? preScores[key] || 0 : postScores[key] || 0;
                const currentAnswer =
                  activeTab === 'pretest' ? preAnswers[key] || '' : postAnswers[key] || '';

                const rubricOpen = !!expandedRubrics[`${activeTab}-${key}`];
                const activeTier = getActiveRubricTier(currentScore);

                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-md"
                  >
                    {/* Question Header & Score input */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                              activeTab === 'pretest'
                                ? 'bg-secondary-100 text-secondary-800'
                                : 'bg-primary-100 text-primary-800'
                            }`}
                          >
                            Soal {q.id}
                          </span>
                          <span className="text-xs text-slate-400">Maks. 20 poin</span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-slate-800">
                          {q.question}
                        </p>
                      </div>

                      {/* Score Input Widget */}
                      <div className="flex flex-row items-center gap-2 self-start sm:self-auto sm:flex-col sm:items-end">
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs font-semibold text-slate-500">
                            Skor Guru:
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={currentScore}
                            onChange={(e) =>
                              setQuestionScore(
                                activeTab === 'pretest' ? 'pre' : 'post',
                                key,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={`h-9 w-18 rounded-lg border-2 text-center text-base font-bold focus:outline-none ${
                              currentScore >= 16
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : currentScore >= 11
                                ? 'border-sky-500 bg-sky-50 text-sky-700'
                                : currentScore >= 6
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-slate-300 bg-slate-50 text-slate-700'
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-400">/ 20</span>
                        </div>

                        {/* Quick preset buttons */}
                        <div className="flex items-center gap-1">
                          {[0, 5, 10, 15, 20].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() =>
                                setQuestionScore(
                                  activeTab === 'pretest' ? 'pre' : 'post',
                                  key,
                                  preset
                                )
                              }
                              className={`h-6 px-1.5 rounded text-[11px] font-semibold transition-colors ${
                                currentScore === preset
                                  ? 'bg-slate-800 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Student's answer editor */}
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-slate-500" />
                          Jawaban Siswa (Dapat diedit oleh Guru):
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Koreksi atau lengkapi teks jawaban
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={currentAnswer}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activeTab === 'pretest') {
                            setPreAnswers((prev) => ({ ...prev, [key]: val }));
                          } else {
                            setPostAnswers((prev) => ({ ...prev, [key]: val }));
                          }
                        }}
                        placeholder="Masukkan atau edit jawaban siswa..."
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-800 leading-relaxed focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Rubric Accordion */}
                    {q.rubric && q.rubric.length > 0 && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => toggleRubric(`${activeTab}-${key}`)}
                          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-primary-600" />
                          <span>
                            {rubricOpen ? 'Sembunyikan' : 'Lihat'} Panduan Rubrik Penilaian
                          </span>
                          {rubricOpen ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {rubricOpen && (
                          <div className="mt-2 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:grid-cols-2 animate-fade-in">
                            {q.rubric.map((r, rIdx) => {
                              const isTierActive = activeTier === r.range;
                              return (
                                <div
                                  key={rIdx}
                                  className={`rounded-lg border p-2.5 text-xs transition-all ${
                                    isTierActive
                                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium shadow-xs'
                                      : 'border-slate-200 bg-white text-slate-600'
                                  }`}
                                >
                                  <div className="mb-1 flex items-center justify-between">
                                    <span
                                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                        isTierActive
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      Skor {r.range}
                                    </span>
                                    {isTierActive && (
                                      <span className="text-[10px] font-bold text-emerald-700">
                                        ✓ Sesuai Nilai
                                      </span>
                                    )}
                                  </div>
                                  <p className="leading-snug">{r.description}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-slate-200 bg-white px-5 py-4">
          <div className="text-xs text-slate-500">
            Kenaikan Skor Siswa:{' '}
            <strong className="text-emerald-700 font-bold">
              {scoreDiff >= 0 ? `+${scoreDiff}%` : `${scoreDiff}%`}
            </strong>{' '}
            (<span className="text-emerald-700 font-bold">Naik KKM</span>) • Target Rata-rata Kelas:{' '}
            <strong className="text-emerald-700">19% (Naik KKM)</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary py-2 px-4 text-sm"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
