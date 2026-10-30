export interface RubricLevel {
  range: string;
  description: string;
}

export interface EssayQuestion {
  id: number;
  question: string;
  keywords: string[];
  maxScore: number;
  rubric: RubricLevel[];
}

export const pretestQuestions: EssayQuestion[] = [
  {
    id: 1,
    question:
      'Apa yang dimaksud dengan sistem pernapasan manusia dan sebutkan minimal 3 organ penyusunnya!',
    keywords: ['sistem', 'pernapasan', 'organ', 'hidung', 'tenggorokan', 'paru-paru', 'trakea', 'bronkus'],
    maxScore: 20,
    rubric: [
      { range: '16-20', description: 'Menjelaskan definisi sistem pernapasan dengan benar dan menyebutkan 3 organ atau lebih beserta fungsinya' },
      { range: '11-15', description: 'Menjelaskan definisi sistem pernapasan dan menyebutkan 2 organ penyusun' },
      { range: '6-10', description: 'Menyebutkan definisi secara singkat atau menyebutkan 1-2 organ tanpa penjelasan' },
      { range: '0-5', description: 'Jawaban tidak relevan atau kosong' },
    ],
  },
  {
    id: 2,
    question:
      'Apa yang dimaksud dengan partikel PM2.5 dan mengapa ukurannya berbahaya bagi saluran pernapasan manusia?',
    keywords: ['pm2.5', 'partikel', 'berbahaya', 'saluran pernapasan', 'mikron', 'halus', '2.5 mikron'],
    maxScore: 20,
    rubric: [
      { range: '16-20', description: 'Menjelaskan definisi PM2.5 (ukuran <2,5 mikron) dan menjelaskan secara detail bahayanya bagi saluran pernapasan' },
      { range: '11-15', description: 'Menjelaskan definisi PM2.5 dan menyebutkan alasan bahayanya secara umum' },
      { range: '6-10', description: 'Hanya menyebutkan definisi atau hanya menyebutkan bahayanya tanpa penjelasan' },
      { range: '0-5', description: 'Jawaban tidak relevan atau kosong' },
    ],
  },
  {
    id: 3,
    question:
      'Bagaimana reaksi silia dan lendir di tenggorokan ketika banyak partikel polusi/asap yang terhirup?',
    keywords: ['silia', 'lendir', 'tenggorokan', 'iritasi', 'peradangan', 'partikel', 'polusi', 'gangguan'],
    maxScore: 20,
    rubric: [
      { range: '16-20', description: 'Menjelaskan mekanisme silia dan lendir secara detail serta dampak polusi pada keduanya' },
      { range: '11-15', description: 'Menjelaskan fungsi silia/lendir dan menyebutkan dampak polusi secara umum' },
      { range: '6-10', description: 'Hanya menyebutkan fungsi silia atau lendir tanpa menjelaskan dampak polusi' },
      { range: '0-5', description: 'Jawaban tidak relevan atau kosong' },
    ],
  },
  {
    id: 4,
    question:
      'Sebutkan minimal 3 bahan alam lokal yang dapat digunakan untuk melegakan tenggorokan yang iritasi akibat polusi udara!',
    keywords: ['jahe', 'kencur', 'lemon', 'madu', 'kunyit', 'daun', 'herbal'],
    maxScore: 20,
    rubric: [
      { range: '16-20', description: 'Menyebutkan 3 bahan alam atau lebih dan menjelaskan khasiatnya untuk tenggorokan' },
      { range: '11-15', description: 'Menyebutkan 3 bahan alam dengan penjelasan singkat' },
      { range: '6-10', description: 'Menyebutkan 1-2 bahan alam tanpa penjelasan' },
      { range: '0-5', description: 'Jawaban tidak relevan atau kosong' },
    ],
  },
  {
    id: 5,
    question:
      'Jelaskan upaya yang dapat dilakukan untuk menjaga kesehatan sistem pernapasan saat terpapar kabut asap!',
    keywords: ['masker', 'minuman', 'herbal', 'silia', 'polusi', 'hindari', 'udara', 'sehat', 'olahraga'],
    maxScore: 20,
    rubric: [
      { range: '16-20', description: 'Menyebutkan 3 upaya atau lebih dengan penjelasan yang lengkap dan relevan' },
      { range: '11-15', description: 'Menyebutkan 2-3 upaya dengan penjelasan singkat' },
      { range: '6-10', description: 'Menyebutkan 1-2 upaya tanpa penjelasan' },
      { range: '0-5', description: 'Jawaban tidak relevan atau kosong' },
    ],
  },
];

export const posttestQuestions: EssayQuestion[] = [
  {
    id: 1,
    question:
      'Jelaskan fungsi utama dari hidung, tenggorokan, dan paru-paru dalam sistem pernapasan manusia!',
    keywords: ['hidung', 'tenggorokan', 'paru-paru', 'fungsi', 'napas', 'udara', 'pertukaran', 'oksigen'],
    maxScore: 20,
    rubric: [
      { range: '16-20', description: 'Menjelaskan fungsi ketiga organ (hidung, tenggorokan, paru-paru) secara lengkap dan benar' },
      { range: '11-15', description: 'Menjelaskan fungsi 2 organ dengan benar' },
      { range: '6-10', description: 'Menjelaskan fungsi 1 organ atau penjelasan kurang tepat' },
      { range: '0-5', description: 'Jawaban tidak relevan atau kosong' },
    ],
  },
  {
    id: 2,
    question:
      'Apa yang dimaksud dengan partikel PM2.5 dan jelaskan mengapa partikel ini lebih berbahaya dibandingkan partikel yang lebih besar!',
    keywords: ['pm2.5', 'mikron', 'berbahaya', 'halus', 'saluran pernapasan', 'alveoli', '2.5 mikron', 'menembus'],
    maxScore: 20,
    rubric: [
      { range: '16-20', description: 'Menjelaskan definisi PM2.5 dan perbandingan bahayanya dengan partikel besar secara detail' },
      { range: '11-15', description: 'Menjelaskan definisi PM2.5 dan menyebutkan alasan bahayanya secara umum' },
      { range: '6-10', description: 'Hanya menyebutkan definisi atau hanya menyebutkan bahayanya' },
      { range: '0-5', description: 'Jawaban tidak relevan atau kosong' },
    ],
  },
  {
    id: 3,
    question:
      'Bagaimana mekanisme pertahanan silia dan lendir (mukus) di saluran pernapasan terhadap partikel polusi yang terhirup, dan mengapa paparan kabut asap PM2.5 dapat menyebabkan iritasi tenggorokan?',
    keywords: ['silia', 'lendir', 'mukus', 'partikel', 'iritasi', 'tenggorokan', 'pm2.5', 'peradangan', 'mekanisme', 'pertahanan'],
    maxScore: 20,
    rubric: [
      { range: '16-20', description: 'Menjelaskan mekanisme silia dan mukus secara detail serta menjelaskan hubungannya dengan iritasi akibat PM2.5' },
      { range: '11-15', description: 'Menjelaskan mekanisme silia/mukus dan menyebutkan iritasi secara umum' },
      { range: '6-10', description: 'Hanya menjelaskan salah satu (silia/mukus atau iritasi) tanpa keterkaitan' },
      { range: '0-5', description: 'Jawaban tidak relevan atau kosong' },
    ],
  },
  {
    id: 4,
    question:
      'Sebutkan dan jelaskan kandungan zat aktif pada jahe, kencur, lemon, dan madu yang bermanfaat untuk melegakan tenggorokan, serta jelaskan hubungan sains dan rekayasa dalam perancangan formula minuman tersebut!',
    keywords: ['gingerol', 'jahe', 'kencur', 'lemon', 'vitamin c', 'madu', 'sains', 'rekayasa', 'formula', 'zat aktif'],
    maxScore: 20,
    rubric: [
      { range: '16-20', description: 'Menjelaskan zat aktif pada minimal 3 bahan dan menjelaskan hubungan sains-rekayasa dengan jelas' },
      { range: '11-15', description: 'Menjelaskan zat aktif pada 2-3 bahan dan menyebutkan hubungan sains-rekayasa secara umum' },
      { range: '6-10', description: 'Menyebutkan zat aktif pada 1-2 bahan tanpa menjelaskan hubungan sains-rekayasa' },
      { range: '0-5', description: 'Jawaban tidak relevan atau kosong' },
    ],
  },
  {
    id: 5,
    question:
      'Berdasarkan keseluruhan kegiatan LKPD, jelaskan upaya yang dapat dilakukan untuk menjaga kesehatan sistem pernapasan saat terpapar kabut asap PM2.5 dan kesimpulanmu mengenai pemanfaatan bahan alam lokal untuk mengatasi iritasi tenggorokan!',
    keywords: ['masker', 'herbal', 'hindari', 'polusi', 'bahan alam', 'lokal', 'iritasi', 'tenggorokan', 'pm2.5', 'efektif', 'kesimpulan', 'formula'],
    maxScore: 20,
    rubric: [
      { range: '16-20', description: 'Menyebutkan upaya pencegahan dan memberikan kesimpulan yang komprehensif tentang pemanfaatan bahan alam' },
      { range: '11-15', description: 'Menyebutkan upaya pencegahan dan kesimpulan secara umum' },
      { range: '6-10', description: 'Hanya menyebutkan upaya atau hanya kesimpulan tanpa keterkaitan' },
      { range: '0-5', description: 'Jawaban tidak relevan atau kosong' },
    ],
  },
];

export interface ReflectionItem {
  id: string;
  label: string;
}

export const reflectionItems: ReflectionItem[] = [
  { id: 'senang', label: 'Saya senang belajar tentang sistem pernapasan dan PM2.5' },
  { id: 'paham', label: 'Saya memahami bahaya PM2.5 bagi saluran pernapasan' },
  { id: 'manfaat', label: 'Saya mengerti manfaat bahan alam (jahe, kencur, lemon, madu) untuk pelega tenggorokan' },
  { id: 'tertarik', label: 'Saya tertarik merancang formula minuman herbal sendiri' },
  { id: 'kerjasama', label: 'Saya merasa kerjasama kelompok berjalan dengan baik' },
  { id: 'tantangan', label: 'Saya merasa tertantang saat melakukan uji organoleptik' },
  { id: 'peduli', label: 'Saya menjadi lebih peduli pada kesehatan pernapasan dan kualitas udara' },
  { id: 'ingin_tahu', label: 'Saya ingin tahu lebih lanjut tentang bahan alam untuk kesehatan' },
];

export function gradeEssay(answer: string, keywords: string[], maxScore: number): number {
  if (!answer || answer.trim().length === 0) return 0;
  const normalizedAnswer = answer.toLowerCase();
  const matchedKeywords = keywords.filter((k) => normalizedAnswer.includes(k.toLowerCase()));
  const ratio = matchedKeywords.length / keywords.length;
  const score = Math.round(ratio * maxScore);
  return score;
}
