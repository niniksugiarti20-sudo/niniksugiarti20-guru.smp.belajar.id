import { useState, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  Upload,
  X,
  FlaskConical,
  Beaker,
  Award,
  Loader2,
  Image as ImageIcon,
  Wind,
  Leaf,
  Heart,
  Save,
  RotateCcw,
  ChevronDown,
  ClipboardList,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  pretestQuestions,
  posttestQuestions,
  reflectionItems,
  gradeEssay,
  type EssayQuestion,
  type RubricLevel,
} from '@/lib/questions';

type Stage = 'login' | 'pretest' | 'lkpd1' | 'lkpd2' | 'posttest' | 'done';

interface StudentViewProps {
  onBack: () => void;
}

interface FormulaRow {
  label: string;
  jahe: string;
  kencur: string;
  lemon: string;
  madu: string;
  air: string;
}

interface OrganolepticRow {
  label: string;
  rasa: string;
  aroma: string;
  tekstur: string;
  warna: string;
  nyaman: string;
  total: string;
}

const defaultFormulas: FormulaRow[] = [
  { label: 'Formula 1', jahe: '10', kencur: '0', lemon: '10', madu: '10', air: '200' },
  { label: 'Formula 2', jahe: '15', kencur: '0', lemon: '10', madu: '10', air: '200' },
  { label: 'Formula 3', jahe: '10', kencur: '10', lemon: '10', madu: '10', air: '200' },
  { label: 'Formula Racikan Kelompok Kami', jahe: '', kencur: '', lemon: '', madu: '', air: '' },
];

const defaultScores: OrganolepticRow[] = [
  { label: 'Formula 1', rasa: '', aroma: '', tekstur: '', warna: '', nyaman: '', total: '' },
  { label: 'Formula 2', rasa: '', aroma: '', tekstur: '', warna: '', nyaman: '', total: '' },
  { label: 'Formula 3', rasa: '', aroma: '', tekstur: '', warna: '', nyaman: '', total: '' },
  { label: 'Formula Terbaik Kelompok', rasa: '', aroma: '', tekstur: '', warna: '', nyaman: '', total: '' },
];

const stages: { id: Stage; label: string; icon: typeof BookOpen }[] = [
  { id: 'pretest', label: 'Pre-test', icon: BookOpen },
  { id: 'lkpd1', label: 'LKPD 1', icon: FlaskConical },
  { id: 'lkpd2', label: 'LKPD 2', icon: Beaker },
  { id: 'posttest', label: 'Post-test', icon: ClipboardCheck },
];

export default function StudentView({ onBack }: StudentViewProps) {
  const [stage, setStage] = useState<Stage>('login');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<string[]>(['', '', '', '']);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [existingProgress, setExistingProgress] = useState<{
    id: string;
    status: string;
    pretest_answers: Record<string, { answer: string; score: number }> | null;
    pretest_score: number;
    lkpd1_data: Record<string, unknown> | null;
    lkpd2_data: Record<string, unknown> | null;
    posttest_answers: Record<string, { answer: string; score: number }> | null;
    posttest_score: number;
    reflection: Record<string, boolean> | null;
    group_name: string | null;
    members: string[] | null;
  } | null>(null);
  const [resuming, setResuming] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Pretest state
  const [pretestAnswers, setPretestAnswers] = useState<Record<number, string>>({});
  const [pretestScores, setPretestScores] = useState<Record<number, number>>({});

  // LKPD1 state
  const [formulas, setFormulas] = useState<FormulaRow[]>(defaultFormulas);
  const [lkpd1Q1, setLkpd1Q1] = useState('');
  const [lkpd1Q2, setLkpd1Q2] = useState('');
  const [lkpd1Photos, setLkpd1Photos] = useState<string[]>([]);
  const [uploadingLkpd1, setUploadingLkpd1] = useState(false);

  // LKPD2 state
  const [scores, setScores] = useState<OrganolepticRow[]>(defaultScores);
  const [lkpd2Q1, setLkpd2Q1] = useState('');
  const [lkpd2Q2, setLkpd2Q2] = useState('');
  const [lkpd2Conclusion, setLkpd2Conclusion] = useState('');
  const [lkpd2Photos, setLkpd2Photos] = useState<string[]>([]);
  const [uploadingLkpd2, setUploadingLkpd2] = useState(false);

  // Posttest state
  const [posttestAnswers, setPosttestAnswers] = useState<Record<number, string>>({});
  const [posttestScores, setPosttestScores] = useState<Record<number, number>>({});

  // Reflection state
  const [reflection, setReflection] = useState<Record<string, boolean>>({});

  const [finalResult, setFinalResult] = useState<{
    pretest: number;
    posttest: number;
    total: number;
  } | null>(null);

  // Upload photo
  const uploadPhoto = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from('lkpd-uploads')
      .upload(fileName, file, { contentType: file.type });
    if (error) return null;
    const { data } = supabase.storage.from('lkpd-uploads').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    folder: string,
    setPhotos: React.Dispatch<React.SetStateAction<string[]>>,
    setUploading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadPhoto(file, folder);
      if (url) urls.push(url);
    }
    setPhotos((prev) => [...prev, ...urls]);
    setUploading(false);
    e.target.value = '';
  };

  const removePhoto = (
    url: string,
    setPhotos: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  // Check for existing progress when name/class/group are filled
  const checkExistingProgress = async () => {
    if (!name.trim() || !className.trim() || !groupNumber.trim()) {
      setExistingProgress(null);
      return;
    }
    const { data } = await supabase
      .from('submissions')
      .select('id, status, pretest_answers, pretest_score, lkpd1_data, lkpd2_data, posttest_answers, posttest_score, reflection, group_name, members')
      .eq('student_name', name.trim())
      .eq('class', className.trim())
      .eq('group_number', parseInt(groupNumber))
      .order('updated_at', { ascending: false })
      .limit(1);
    if (data && data.length > 0 && data[0].status === 'in_progress') {
      setExistingProgress(data[0] as typeof existingProgress);
    } else {
      setExistingProgress(null);
    }
  };

  // Load saved data into state
  const loadSavedData = (saved: NonNullable<typeof existingProgress>) => {
    const pa = saved.pretest_answers || {};
    const newPretestAnswers: Record<number, string> = {};
    const newPretestScores: Record<number, number> = {};
    Object.entries(pa).forEach(([key, val]) => {
      const id = parseInt(key);
      const item = val as { answer: string; score: number };
      newPretestAnswers[id] = item.answer;
      newPretestScores[id] = item.score;
    });
    setPretestAnswers(newPretestAnswers);
    setPretestScores(newPretestScores);

    const lk1 = saved.lkpd1_data || {};
    if (lk1.formulas && Array.isArray(lk1.formulas)) {
      setFormulas(lk1.formulas as FormulaRow[]);
    }
    if (lk1.q1) setLkpd1Q1((lk1.q1 as { answer: string }).answer);
    if (lk1.q2) setLkpd1Q2((lk1.q2 as { answer: string }).answer);
    if (lk1.photos && Array.isArray(lk1.photos)) setLkpd1Photos(lk1.photos as string[]);

    const lk2 = saved.lkpd2_data || {};
    if (lk2.scores && Array.isArray(lk2.scores)) {
      setScores(lk2.scores as OrganolepticRow[]);
    }
    if (lk2.q1) setLkpd2Q1((lk2.q1 as { answer: string }).answer);
    if (lk2.q2) setLkpd2Q2((lk2.q2 as { answer: string }).answer);
    if (lk2.conclusion) setLkpd2Conclusion((lk2.conclusion as { answer: string }).answer);
    if (lk2.photos && Array.isArray(lk2.photos)) setLkpd2Photos(lk2.photos as string[]);

    const poa = saved.posttest_answers || {};
    const newPostAnswers: Record<number, string> = {};
    const newPostScores: Record<number, number> = {};
    Object.entries(poa).forEach(([key, val]) => {
      const id = parseInt(key);
      const item = val as { answer: string; score: number };
      newPostAnswers[id] = item.answer;
      newPostScores[id] = item.score;
    });
    setPosttestAnswers(newPostAnswers);
    setPosttestScores(newPostScores);

    if (saved.reflection) setReflection(saved.reflection);

    if (saved.group_name) setGroupName(saved.group_name);
    if (saved.members) setMembers([...saved.members, '', '', '', ''].slice(0, 4));
  };

  // Determine which stage to resume at based on saved data
  const getResumeStage = (saved: NonNullable<typeof existingProgress>): Stage => {
    const lk2 = saved.lkpd2_data || {};
    if (lk2.scores && Array.isArray(lk2.scores) && (lk2.scores as OrganolepticRow[]).some(r => r.rasa)) {
      return 'posttest';
    }
    const lk1 = saved.lkpd1_data || {};
    if (lk1.formulas && Array.isArray(lk1.formulas)) {
      return 'lkpd2';
    }
    const pa = saved.pretest_answers || {};
    if (Object.keys(pa).length > 0) {
      return 'lkpd1';
    }
    return 'pretest';
  };

  // Start fresh session
  const handleStart = async () => {
    if (!name.trim() || !className.trim() || !groupNumber.trim()) {
      setLoginError('Nama, kelas, dan kelompok harus diisi.');
      return;
    }
    setLoginError('');
    setSaving(true);

    if (existingProgress) {
      await supabase.from('submissions').delete().eq('id', existingProgress.id);
      setExistingProgress(null);
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        student_name: name.trim(),
        class: className.trim(),
        group_number: parseInt(groupNumber),
        group_name: groupName.trim() || null,
        members: members.filter((m) => m.trim()),
        status: 'in_progress',
      })
      .select('id')
      .single();
    if (!error && data) {
      setSubmissionId(data.id);
      setStage('pretest');
    }
    setSaving(false);
  };

  // Resume existing session
  const handleResume = () => {
    if (!existingProgress) return;
    setResuming(true);
    setSubmissionId(existingProgress.id);
    loadSavedData(existingProgress);
    const resumeStage = getResumeStage(existingProgress);
    setStage(resumeStage);
    setResuming(false);
  };

  // Save current progress without advancing
  const handleSaveDraft = async () => {
    if (!submissionId) return;
    setSaving(true);

    const pretestObj: Record<string, { answer: string; score: number }> = {};
    pretestQuestions.forEach((q) => {
      pretestObj[q.id] = {
        answer: pretestAnswers[q.id] || '',
        score: pretestScores[q.id] || 0,
      };
    });

    const calculatedScores = scores.map((s) => {
      const vals = [s.rasa, s.aroma, s.tekstur, s.warna, s.nyaman].map((v) =>
        v ? parseInt(v) || 0 : 0
      );
      return { ...s, total: String(vals.reduce((sum, v) => sum + v, 0)) };
    });

    const posttestObj: Record<string, { answer: string; score: number }> = {};
    posttestQuestions.forEach((q) => {
      posttestObj[q.id] = {
        answer: posttestAnswers[q.id] || '',
        score: posttestScores[q.id] || 0,
      };
    });

    let pretestTotal = 0;
    pretestQuestions.forEach((q) => {
      pretestTotal += pretestScores[q.id] || 0;
    });
    let posttestTotal = 0;
    posttestQuestions.forEach((q) => {
      posttestTotal += posttestScores[q.id] || 0;
    });

    await saveProgress({
      pretest_answers: pretestObj,
      pretest_score: pretestTotal,
      lkpd1_data: {
        formulas,
        q1: { answer: lkpd1Q1 },
        q2: { answer: lkpd1Q2 },
        photos: lkpd1Photos,
      },
      lkpd2_data: {
        scores: calculatedScores,
        q1: { answer: lkpd2Q1 },
        q2: { answer: lkpd2Q2 },
        conclusion: { answer: lkpd2Conclusion },
        photos: lkpd2Photos,
      },
      posttest_answers: posttestObj,
      posttest_score: posttestTotal,
      total_score: pretestTotal + posttestTotal,
      reflection,
    });

    setSaving(false);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };

  // Save progress
  const saveProgress = useCallback(
    async (updates: Record<string, unknown>) => {
      if (!submissionId) return;
      await supabase
        .from('submissions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', submissionId);
    },
    [submissionId]
  );

  // Submit pretest
  const submitPretest = async () => {
    const scoresMap: Record<number, number> = {};
    let totalScore = 0;
    pretestQuestions.forEach((q) => {
      const ans = pretestAnswers[q.id] || '';
      const sc = gradeEssay(ans, q.keywords, q.maxScore);
      scoresMap[q.id] = sc;
      totalScore += sc;
    });
    setPretestScores(scoresMap);

    const answersObj: Record<string, { answer: string; score: number }> = {};
    pretestQuestions.forEach((q) => {
      answersObj[q.id] = {
        answer: pretestAnswers[q.id] || '',
        score: scoresMap[q.id],
      };
    });

    await saveProgress({
      pretest_answers: answersObj,
      pretest_score: totalScore,
    });
    setStage('lkpd1');
  };

  // Submit LKPD1
  const submitLkpd1 = async () => {
    await saveProgress({
      lkpd1_data: {
        formulas,
        q1: { answer: lkpd1Q1 },
        q2: { answer: lkpd1Q2 },
        photos: lkpd1Photos,
      },
    });
    setStage('lkpd2');
  };

  // Submit LKPD2
  const submitLkpd2 = async () => {
    const calculatedScores = scores.map((s) => {
      const vals = [s.rasa, s.aroma, s.tekstur, s.warna, s.nyaman].map((v) =>
        v ? parseInt(v) || 0 : 0
      );
      const total = vals.reduce((sum, v) => sum + v, 0);
      return { ...s, total: String(total) };
    });
    setScores(calculatedScores);

    await saveProgress({
      lkpd2_data: {
        scores: calculatedScores,
        q1: { answer: lkpd2Q1 },
        q2: { answer: lkpd2Q2 },
        conclusion: { answer: lkpd2Conclusion },
        photos: lkpd2Photos,
      },
    });
    setStage('posttest');
  };

  // Submit posttest
  const submitPosttest = async () => {
    const scoresMap: Record<number, number> = {};
    let totalScore = 0;
    posttestQuestions.forEach((q) => {
      const ans = posttestAnswers[q.id] || '';
      const sc = gradeEssay(ans, q.keywords, q.maxScore);
      scoresMap[q.id] = sc;
      totalScore += sc;
    });
    setPosttestScores(scoresMap);

    const answersObj: Record<string, { answer: string; score: number }> = {};
    posttestQuestions.forEach((q) => {
      answersObj[q.id] = {
        answer: posttestAnswers[q.id] || '',
        score: scoresMap[q.id],
      };
    });

    // Get pretest score from earlier
    let pretestTotal = 0;
    pretestQuestions.forEach((q) => {
      pretestTotal += pretestScores[q.id] || 0;
    });

    const grandTotal = pretestTotal + totalScore;

    await saveProgress({
      posttest_answers: answersObj,
      posttest_score: totalScore,
      total_score: grandTotal,
      reflection,
      status: 'completed',
    });

    setFinalResult({ pretest: pretestTotal, posttest: totalScore, total: grandTotal });
    setStage('done');
  };

  // Login screen
  if (stage === 'login') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-900 flex items-center justify-center px-4 py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-secondary-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-lg animate-scale-in">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-secondary-100/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Kembali</span>
          </button>

          <div className="card p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-700 shadow-lg shadow-secondary-500/30">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Dasbor Murid</h2>
              <p className="mt-1 text-slate-500">Lengkapi data diri untuk memulai LKPD</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setExistingProgress(null);
                  }}
                  onBlur={checkExistingProgress}
                  placeholder="Masukkan nama lengkap"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => {
                      setClassName(e.target.value);
                      setExistingProgress(null);
                    }}
                    onBlur={checkExistingProgress}
                    placeholder="cth: 8A"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Kelompok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={groupNumber}
                    onChange={(e) => {
                      setGroupNumber(e.target.value);
                      setExistingProgress(null);
                    }}
                    onBlur={checkExistingProgress}
                    placeholder="cth: 1"
                    className="input-field"
                    min={1}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nama Kelompok (opsional)
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="cth: Tim Pelega Tenggorok"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Anggota Kelompok
                </label>
                <div className="space-y-2">
                  {members.map((m, i) => (
                    <input
                      key={i}
                      type="text"
                      value={m}
                      onChange={(e) => {
                        const next = [...members];
                        next[i] = e.target.value;
                        setMembers(next);
                      }}
                      placeholder={`Anggota ${i + 1}`}
                      className="input-field"
                    />
                  ))}
                </div>
              </div>

              {loginError && (
                <p className="text-sm text-red-500 animate-fade-in">{loginError}</p>
              )}

              {existingProgress ? (
                <div className="space-y-3">
                  <div className="rounded-xl border-2 border-primary-200 bg-primary-50/60 p-4 animate-fade-in">
                    <div className="flex items-start gap-3">
                      <RotateCcw className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" />
                      <div>
                        <p className="text-sm font-bold text-primary-800">
                          Ditemukan pekerjaan tersimpan!
                        </p>
                        <p className="mt-1 text-xs text-primary-700">
                          Kamu memiliki pekerjaan yang belum selesai. Klik "Lanjutkan" untuk melanjutkan dari titik terakhir, atau "Mulai Baru" untuk mengulang dari awal.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleResume}
                    disabled={resuming}
                    className="btn-primary w-full"
                  >
                    {resuming ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Memuat...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-5 w-5" />
                        Lanjutkan Pekerjaan
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleStart}
                    disabled={saving}
                    className="btn-secondary w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Menyiapkan...
                      </>
                    ) : (
                      <>
                        Mulai Baru
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStart}
                  disabled={saving}
                  className="btn-secondary w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Menyiapkan...
                    </>
                  ) : (
                    <>
                      Mulai Mengerjakan
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Done screen
  if (stage === 'done' && finalResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg animate-scale-in">
          <div className="card p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">LKPD Selesai!</h2>
            <p className="mb-8 text-slate-500">
              Terima kasih, {name}! Semua jawaban dan foto telah terkirim ke dasbor guru.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl bg-secondary-50 p-4">
                <p className="text-xs font-medium text-slate-500">Pre-test</p>
                <p className="mt-1 text-2xl font-bold text-secondary-700">
                  {finalResult.pretest}<span className="text-sm font-medium text-slate-400">/100</span>
                </p>
              </div>
              <div className="rounded-xl bg-primary-50 p-4">
                <p className="text-xs font-medium text-slate-500">Post-test</p>
                <p className="mt-1 text-2xl font-bold text-primary-700">
                  {finalResult.posttest}<span className="text-sm font-medium text-slate-400">/100</span>
                </p>
              </div>
              <div className="rounded-xl bg-accent-50 p-4">
                <p className="text-xs font-medium text-slate-500">Total</p>
                <p className="mt-1 text-2xl font-bold text-accent-700">
                  {finalResult.total}<span className="text-sm font-medium text-slate-400">/200</span>
                </p>
              </div>
            </div>

            <button onClick={onBack} className="btn-primary w-full">
              Kembali ke Halaman Awal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Progress bar
  const currentIdx = stages.findIndex((s) => s.id === stage);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-700 shadow-md">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{name}</p>
              <p className="text-xs text-slate-500">
                {className} • Kelompok {groupNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Simpan</span>
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
        {/* Progress steps */}
        <div className="mx-auto max-w-5xl px-4 pb-3 sm:px-6">
          <div className="flex items-center gap-1">
            {stages.map((s, i) => {
              const Icon = s.icon;
              const isDone = i < currentIdx;
              const isActive = i === currentIdx;
              return (
                <div key={s.id} className="flex flex-1 items-center gap-1">
                  <div
                    className={`flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-secondary-100 text-secondary-700'
                        : isDone
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        isActive
                          ? 'bg-secondary-500 text-white'
                          : isDone
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-300 text-white'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < stages.length - 1 && (
                    <div className={`h-0.5 w-2 ${isDone ? 'bg-primary-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {stage === 'pretest' && (
          <PretestStage
            answers={pretestAnswers}
            setAnswers={setPretestAnswers}
            scores={pretestScores}
            onSubmit={submitPretest}
            onSave={handleSaveDraft}
            saving={saving}
          />
        )}
        {stage === 'lkpd1' && (
          <LKPD1Stage
            formulas={formulas}
            setFormulas={setFormulas}
            q1={lkpd1Q1}
            setQ1={setLkpd1Q1}
            q2={lkpd1Q2}
            setQ2={setLkpd1Q2}
            photos={lkpd1Photos}
            uploading={uploadingLkpd1}
            onUpload={(e) =>
              handleFileUpload(e, 'lkpd1', setLkpd1Photos, setUploadingLkpd1)
            }
            onRemovePhoto={(url) => removePhoto(url, setLkpd1Photos)}
            onSubmit={submitLkpd1}
            onSave={handleSaveDraft}
            saving={saving}
          />
        )}
        {stage === 'lkpd2' && (
          <LKPD2Stage
            scores={scores}
            setScores={setScores}
            q1={lkpd2Q1}
            setQ1={setLkpd2Q1}
            q2={lkpd2Q2}
            setQ2={setLkpd2Q2}
            conclusion={lkpd2Conclusion}
            setConclusion={setLkpd2Conclusion}
            photos={lkpd2Photos}
            uploading={uploadingLkpd2}
            onUpload={(e) =>
              handleFileUpload(e, 'lkpd2', setLkpd2Photos, setUploadingLkpd2)
            }
            onRemovePhoto={(url) => removePhoto(url, setLkpd2Photos)}
            onSubmit={submitLkpd2}
            onSave={handleSaveDraft}
            saving={saving}
          />
        )}
        {stage === 'posttest' && (
          <PosttestStage
            questions={posttestQuestions}
            answers={posttestAnswers}
            setAnswers={setPosttestAnswers}
            scores={posttestScores}
            reflection={reflection}
            setReflection={setReflection}
            onSubmit={submitPosttest}
            onSave={handleSaveDraft}
            saving={saving}
          />
        )}
      </main>

      {/* Save toast */}
      {showSaveToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
          <div className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 shadow-lg shadow-primary-500/30">
            <CheckCircle2 className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold text-white">
              Pekerjaan berhasil disimpan!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ PRETEST ============
function PretestStage({
  answers,
  setAnswers,
  scores,
  onSubmit,
  onSave,
  saving,
}: {
  answers: Record<number, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  scores: Record<number, number>;
  onSubmit: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="animate-slide-up">
      <SectionHeader
        icon={BookOpen}
        title="Pre-test"
        subtitle="Sistem Pernapasan Manusia & Upaya Menjaga Kesehatan Sistem Pernapasan"
        color="secondary"
      />

      <div className="card mb-4 flex items-start gap-3 border-l-4 border-l-secondary-400 bg-secondary-50/50 p-4">
        <Wind className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary-500" />
        <p className="text-sm text-slate-600">
          Jawablah pertanyaan berikut dalam bentuk esai. Skor akan diberikan otomatis berdasarkan
          kata kunci dalam jawabanmu. Baca dengan teliti dan jawab sesuai pemahamanmu.
        </p>
      </div>

      <div className="space-y-4">
        {pretestQuestions.map((q, i) => (
          <div key={q.id} className="card p-5">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-secondary-100 text-sm font-bold text-secondary-700">
                  {i + 1}
                </span>
                <p className="font-semibold text-slate-800">{q.question}</p>
              </div>
            </div>
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
              placeholder="Tulis jawabanmu di sini..."
              rows={4}
              className="input-field resize-y"
            />
            <div className="mt-2 flex items-center justify-between">
              <RubricToggle rubric={q.rubric} />
              {scores[q.id] !== undefined && (
                <p className="text-sm font-semibold text-secondary-600">
                  Skor: {scores[q.id]} / {q.maxScore}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Simpan Sementara
        </button>
        <button onClick={onSubmit} className="btn-secondary">
          Lanjut ke LKPD 1
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// ============ LKPD 1 ============
function LKPD1Stage({
  formulas,
  setFormulas,
  q1,
  setQ1,
  q2,
  setQ2,
  photos,
  uploading,
  onUpload,
  onRemovePhoto,
  onSubmit,
  onSave,
  saving,
}: {
  formulas: FormulaRow[];
  setFormulas: React.Dispatch<React.SetStateAction<FormulaRow[]>>;
  q1: string;
  setQ1: React.Dispatch<React.SetStateAction<string>>;
  q2: string;
  setQ2: React.Dispatch<React.SetStateAction<string>>;
  photos: string[];
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (url: string) => void;
  onSubmit: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const updateFormula = (i: number, key: keyof FormulaRow, val: string) => {
    setFormulas((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, [key]: val } : f))
    );
  };

  return (
    <div className="animate-slide-up">
      <SectionHeader
        icon={FlaskConical}
        title="LKPD 1: Misteri PM2.5 & Perancangan Formula Minuman Pelega Tenggorokan"
        subtitle="Mempelajari PM2.5 dan merancang formula minuman herbal"
        color="primary"
      />

      {/* Section A: Memahami PM2.5 */}
      <div className="card mb-4 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
            A
          </span>
          Memahami PM2.5 & Tenggorokan
        </h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 font-medium text-slate-700">
              1. Apa yang dimaksud dengan partikel PM2.5 dan mengapa ukurannya sangat berbahaya
              bagi saluran pernapasan manusia?
            </p>
            <textarea
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              placeholder="Jawab di sini..."
              rows={3}
              className="input-field resize-y"
            />
          </div>
          <div>
            <p className="mb-2 font-medium text-slate-700">
              2. Bagaimana reaksi silia dan lendir di tenggorokan ketika banyak partikel
              polusi/asap yang terhirup?
            </p>
            <textarea
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              placeholder="Jawab di sini..."
              rows={3}
              className="input-field resize-y"
            />
          </div>
        </div>
      </div>

      {/* Section B: Bahan Alam */}
      <div className="card mb-4 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
            B
          </span>
          Mengenal Bahan Alam Lokal (Science)
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Jahe', desc: 'Mengandung gingerol, memberikan rasa hangat dan aroma khas', icon: Leaf },
            { name: 'Kencur', desc: 'Mengandung ethyl p-methoxycinnamate, aroma kuat dan kelegaan', icon: Leaf },
            { name: 'Lemon', desc: 'Kaya vitamin C, memberikan kesegaran dan rasa citrus', icon: Leaf },
            { name: 'Madu', desc: 'Pemanis alami, melapisi dan lembut di tenggorokan', icon: Leaf },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.name}
                className="rounded-xl border-2 border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-primary-200"
              >
                <Icon className="mb-2 h-5 w-5 text-primary-500" />
                <p className="font-bold text-slate-800">{b.name}</p>
                <p className="mt-1 text-xs text-slate-500">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section C: Rancang Formula */}
      <div className="card mb-4 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
            C
          </span>
          Rancang Formula Minuman Pelega Tenggorokan (Engineering & Math)
        </h3>
        <p className="mb-3 text-sm text-slate-500">
          Tentukan komposisi racikan kelompokmu pada tabel uji coba awal berikut:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 text-left font-bold text-slate-700">Formula</th>
                <th className="py-3 text-center font-bold text-slate-700">Jahe (g)</th>
                <th className="py-3 text-center font-bold text-slate-700">Kencur (g)</th>
                <th className="py-3 text-center font-bold text-slate-700">Lemon (ml)</th>
                <th className="py-3 text-center font-bold text-slate-700">Madu (g)</th>
                <th className="py-3 text-center font-bold text-slate-700">Air (ml)</th>
              </tr>
            </thead>
            <tbody>
              {formulas.map((f, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-700">{f.label}</td>
                  {(['jahe', 'kencur', 'lemon', 'madu', 'air'] as const).map((key) => (
                    <td key={key} className="py-2 text-center">
                      <input
                        type="text"
                        value={f[key]}
                        onChange={(e) => updateFormula(i, key, e.target.value)}
                        className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 focus:outline-none"
                        disabled={i < 3}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload photos */}
      <PhotoUpload
        title="Foto Proses & Hasil LKPD 1"
        subtitle="Unggah foto kegiatan kelompokmu: persiapan bahan, proses peracikan, dan hasil minuman"
        photos={photos}
        uploading={uploading}
        onUpload={onUpload}
        onRemove={onRemovePhoto}
      />

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Simpan Sementara
        </button>
        <button onClick={onSubmit} className="btn-secondary">
          Lanjut ke LKPD 2
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// ============ LKPD 2 ============
function LKPD2Stage({
  scores,
  setScores,
  q1,
  setQ1,
  q2,
  setQ2,
  conclusion,
  setConclusion,
  photos,
  uploading,
  onUpload,
  onRemovePhoto,
  onSubmit,
  onSave,
  saving,
}: {
  scores: OrganolepticRow[];
  setScores: React.Dispatch<React.SetStateAction<OrganolepticRow[]>>;
  q1: string;
  setQ1: React.Dispatch<React.SetStateAction<string>>;
  q2: string;
  setQ2: React.Dispatch<React.SetStateAction<string>>;
  conclusion: string;
  setConclusion: React.Dispatch<React.SetStateAction<string>>;
  photos: string[];
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (url: string) => void;
  onSubmit: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const updateScore = (
    i: number,
    key: keyof OrganolepticRow,
    val: string
  ) => {
    setScores((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [key]: val } : s))
    );
  };

  return (
    <div className="animate-slide-up">
      <SectionHeader
        icon={Beaker}
        title="LKPD 2: Pengujian dan Analisis Minuman Pelega Tenggorokan"
        subtitle="Melakukan uji organoleptik dan menganalisis hasil formula"
        color="primary"
      />

      {/* Section A: Langkah Kerja */}
      <div className="card mb-4 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
            A
          </span>
          Langkah Kerja Uji Coba
        </h3>
        <ol className="space-y-3">
          {[
            'Siapkan bahan sesuai formula yang telah dirancang pada LKPD 1.',
            'Lakukan proses pengolahan (pencucian, penghalusan/pemerasan, dan pencampuran dengan air hangat) secara higienis.',
            'Mintalah penilaian uji organoleptik kepada anggota kelompok atau penguji lain (minimal beberapa orang).',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {i + 1}
              </span>
              <p className="text-slate-700">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Section B: Tabel Hasil */}
      <div className="card mb-4 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
            B
          </span>
          Tabel Hasil Uji Coba (Organoleptik)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 text-left font-bold text-slate-700">Formula</th>
                <th className="py-3 text-center font-bold text-slate-700">Rasa</th>
                <th className="py-3 text-center font-bold text-slate-700">Aroma</th>
                <th className="py-3 text-center font-bold text-slate-700">Tekstur</th>
                <th className="py-3 text-center font-bold text-slate-700">Warna</th>
                <th className="py-3 text-center font-bold text-slate-700">Nyaman</th>
                <th className="py-3 text-center font-bold text-slate-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((row, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 pr-2 font-medium text-slate-700">{row.label}</td>
                  {(['rasa', 'aroma', 'tekstur', 'warna', 'nyaman'] as const).map((key) => (
                    <td key={key} className="py-2 text-center">
                      <select
                        value={row[key]}
                        onChange={(e) => updateScore(i, key, e.target.value)}
                        className="w-14 rounded-lg border border-slate-200 px-1 py-1 text-center text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 focus:outline-none"
                      >
                        <option value="">-</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                  <td className="py-2 text-center">
                    <span className="font-bold text-primary-600">
                      {[row.rasa, row.aroma, row.tekstur, row.warna, row.nyaman]
                        .reduce((sum, v) => sum + (parseInt(v) || 0), 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-xl bg-accent-50 p-3">
          <p className="text-xs font-medium text-accent-700">
            Keterangan Skala: 1 = Sangat Tidak Nyaman/Pahit | 2 = Kurang Nyaman | 3 = Cukup | 4 =
            Nyaman & Segar | 5 = Sangat Plong & Menenangkan
          </p>
        </div>
      </div>

      {/* Section C: Analisis */}
      <div className="card mb-4 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
            C
          </span>
          Analisis Data & Kesimpulan
        </h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 font-medium text-slate-700">
              1. Formula manakah yang memperoleh total skor tertinggi dalam memberikan kelegaan
              pada tenggorokan?
            </p>
            <textarea
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              placeholder="Jawab di sini..."
              rows={2}
              className="input-field resize-y"
            />
          </div>
          <div>
            <p className="mb-2 font-medium text-slate-700">
              2. Mengapa kombinasi bahan alam tersebut dapat membantu menjaga kenyamanan sistem
              pernapasan saat terpapar kabut asap?
            </p>
            <textarea
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              placeholder="Jawab di sini..."
              rows={3}
              className="input-field resize-y"
            />
          </div>
          <div>
            <p className="mb-2 font-medium text-slate-700">3. Kesimpulan Kelompok:</p>
            <textarea
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder='"Produk minuman herbal pelega tenggorokan terbaik racikan kelompok kami menggunakan komposisi: Jahe (...) gram, Kencur (...) gram, Lemon (...) ml, Madu (...) gram, dan Air (...) ml terbukti efektif memberikan rasa hangat serta melegakan tenggorokan dari iritasi akibat polusi udara."'
              rows={4}
              className="input-field resize-y"
            />
          </div>
        </div>
      </div>

      {/* Upload photos */}
      <PhotoUpload
        title="Foto Proses & Hasil LKPD 2"
        subtitle="Unggah foto pengujian: proses pembuatan, uji organoleptik, dan hasil minuman terbaik"
        photos={photos}
        uploading={uploading}
        onUpload={onUpload}
        onRemove={onRemovePhoto}
      />

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Simpan Sementara
        </button>
        <button onClick={onSubmit} className="btn-secondary">
          Lanjut ke Post-test
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// ============ POSTTEST ============
function PosttestStage({
  questions,
  answers,
  setAnswers,
  scores,
  reflection,
  setReflection,
  onSubmit,
  onSave,
  saving,
}: {
  questions: EssayQuestion[];
  answers: Record<number, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  scores: Record<number, number>;
  reflection: Record<string, boolean>;
  setReflection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onSubmit: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    onSubmit();
  };

  const toggleReflection = (id: string) => {
    setReflection((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="animate-slide-up">
      <SectionHeader
        icon={ClipboardCheck}
        title="Post-test"
        subtitle="5 soal esai — dinilai otomatis berdasarkan kata kunci"
        color="primary"
      />

      <div className="card mb-4 flex items-start gap-3 border-l-4 border-l-primary-400 bg-primary-50/50 p-4">
        <Award className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-500" />
        <p className="text-sm text-slate-600">
          Jawablah 5 soal berikut dengan lengkap. Skor akan dihitung otomatis berdasarkan
          kesesuaian jawaban dengan kata kunci. Total skor post-test adalah 100.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="card p-5">
            <div className="mb-3 flex items-start gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700">
                {i + 1}
              </span>
              <p className="font-semibold text-slate-800">{q.question}</p>
            </div>
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
              placeholder="Tulis jawabanmu di sini..."
              rows={4}
              className="input-field resize-y"
            />
            <div className="mt-2 flex items-center justify-end">
              <RubricToggle rubric={q.rubric} />
            </div>
          </div>
        ))}
      </div>

      {/* Reflection */}
      <div className="card mt-6 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-100">
            <Heart className="h-5 w-5 text-accent-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Refleksi Pembelajaran</h3>
            <p className="text-sm text-slate-500">
              Centang pernyataan yang sesuai dengan perasaanmu selama belajar hari ini
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {reflectionItems.map((item) => {
            const checked = reflection[item.id] || false;
            return (
              <button
                key={item.id}
                onClick={() => toggleReflection(item.id)}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  checked
                    ? 'border-primary-400 bg-primary-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-all ${
                    checked
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    checked ? 'text-primary-800' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Simpan Sementara
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Selesaikan LKPD
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============ SHARED COMPONENTS ============
function RubricToggle({ rubric }: { rubric: RubricLevel[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-700"
      >
        <ClipboardList className="h-4 w-4" />
        Rubrik Penilaian
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2 text-left font-bold text-slate-600">Skor</th>
                <th className="px-3 py-2 text-left font-bold text-slate-600">Kriteria</th>
              </tr>
            </thead>
            <tbody>
              {rubric.map((level, i) => (
                <tr key={i} className={`border-b border-slate-100 ${i === rubric.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-3 py-2 font-bold text-slate-700 whitespace-nowrap">{level.range}</td>
                  <td className="px-3 py-2 text-slate-600">{level.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color,
}: {
  icon: typeof BookOpen;
  title: string;
  subtitle: string;
  color: 'primary' | 'secondary';
}) {
  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${
            color === 'primary'
              ? 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary-500/30'
              : 'bg-gradient-to-br from-secondary-500 to-secondary-700 shadow-secondary-500/30'
          }`}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function PhotoUpload({
  title,
  subtitle,
  photos,
  uploading,
  onUpload,
  onRemove,
}: {
  title: string;
  subtitle: string;
  photos: string[];
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (url: string) => void;
}) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-100">
          <Upload className="h-5 w-5 text-accent-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Upload button */}
      <label
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 transition-all hover:border-primary-400 hover:bg-primary-50/50 ${
          uploading ? 'opacity-50' : ''
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary-500" />
            <p className="text-sm font-medium text-slate-500">Mengunggah...</p>
          </>
        ) : (
          <>
            <ImageIcon className="mb-2 h-8 w-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">
              Klik untuk mengunggah foto
            </p>
            <p className="text-xs text-slate-400">Bisa pilih beberapa foto sekaligus</p>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {/* Photo preview grid */}
      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((url, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl border border-slate-200"
            >
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="h-32 w-full object-cover"
              />
              <button
                onClick={() => onRemove(url)}
                className="absolute right-2 top-2 rounded-lg bg-slate-900/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
