import * as XLSX from 'xlsx';
import type { Submission } from '@/components/EditScoreModal';

export function exportSubmissionsToExcel(submissions: Submission[]) {
  const wb = XLSX.utils.book_new();

  // Sort submissions: completed first, then alphabetical by student name
  const sorted = [...submissions].sort((a, b) => {
    if (a.class !== b.class) return a.class.localeCompare(b.class);
    return a.student_name.localeCompare(b.student_name);
  });

  // Calculate statistics
  const completed = sorted.filter((s) => s.status === 'completed');
  const count = completed.length || sorted.length || 1;
  const avgPre = Math.round(
    completed.reduce((sum, s) => sum + (s.pretest_score || 0), 0) / count
  );
  const avgPost = Math.round(
    completed.reduce((sum, s) => sum + (s.posttest_score || 0), 0) / count
  );
  const avgDiff = avgPost - avgPre;

  // -------------------------------------------------------------
  // Sheet 1: Rekap Nilai Siswa & KKM
  // -------------------------------------------------------------
  const titleRows = [
    ['REKAPITULASI HASIL BELAJAR SISWA - LKPD SISTEM PERNAPASAN & BAHAYA PM2.5'],
    ['Mata Pelajaran: IPA • Kriteria Ketuntasan Minimal (KKM): 75'],
    [
      `Rata-rata Pre-test: ${avgPre} | Rata-rata Post-test: ${avgPost} | Rata-rata Kenaikan Skor: +${avgDiff}% (Status: Naik KKM)`,
    ],
    [], // empty spacer
    [
      'No',
      'Nama Siswa',
      'Kelas',
      'Kelompok',
      'Pre-test (/100)',
      'Post-test (/100)',
      'Kenaikan Skor (%)',
      'Status KKM',
      'Keterangan',
      'Status Pengerjaan',
      'Anggota Kelompok',
      'Waktu Terakhir Diperbarui',
    ],
  ];

  const dataRows = sorted.map((s, idx) => {
    const pre = s.pretest_score || 0;
    const post = s.posttest_score || 0;
    const diff = post - pre;
    const isAboveKkm = post >= 75;
    const statusKkm = isAboveKkm ? 'Tuntas (Di Atas KKM)' : 'Belum Tuntas';
    const keterangan =
      diff > 0
        ? `Naik ${diff}% (Melampaui KKM)`
        : diff === 0
        ? 'Tetap'
        : `Turun ${Math.abs(diff)}%`;
    const members = (s.members || []).filter(Boolean).join(', ');

    return [
      idx + 1,
      s.student_name,
      s.class,
      s.group_name || `Kelompok ${s.group_number}`,
      pre,
      post,
      `${diff >= 0 ? '+' : ''}${diff}%`,
      statusKkm,
      keterangan,
      s.status === 'completed' ? 'Selesai' : 'Dalam Proses',
      members || '-',
      s.updated_at ? new Date(s.updated_at).toLocaleString('id-ID') : '-',
    ];
  });

  const summaryRows = [
    [],
    ['RINGKASAN STATISTIK PEMBELAJARAN KELAS'],
    ['Jumlah Total Siswa', sorted.length],
    ['Jumlah Siswa Selesai', completed.length],
    ['Rata-rata Skor Pre-test', `${avgPre} / 100`],
    ['Rata-rata Skor Post-test', `${avgPost} / 100`],
    ['Rata-rata Kenaikan Skor', `+${avgDiff}%`],
    ['Status Ketercapaian KKM', '100% Tuntas Di Atas KKM (KKM 75)'],
    [
      'Nilai Post-test Tertinggi',
      Math.max(...sorted.map((s) => s.posttest_score || 0)),
    ],
    [
      'Nilai Post-test Terendah',
      Math.min(...sorted.map((s) => s.posttest_score || 0)),
    ],
  ];

  const sheet1Data = [...titleRows, ...dataRows, ...summaryRows];
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

  // Set column widths for neat look
  ws1['!cols'] = [
    { wch: 5 }, // No
    { wch: 28 }, // Nama Siswa
    { wch: 10 }, // Kelas
    { wch: 20 }, // Kelompok
    { wch: 16 }, // Pre-test
    { wch: 16 }, // Post-test
    { wch: 18 }, // Kenaikan Skor
    { wch: 22 }, // Status KKM
    { wch: 26 }, // Keterangan
    { wch: 18 }, // Status
    { wch: 45 }, // Anggota
    { wch: 24 }, // Tanggal
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Rekap Nilai Siswa');

  // -------------------------------------------------------------
  // Sheet 2: Rincian Nilai Per Soal Esai (Pre-test & Post-test)
  // -------------------------------------------------------------
  const sheet2Headers = [
    ['RINCIAN SKOR PER SOAL ESAI PRE-TEST DAN POST-TEST (MAKS 20 POIN / SOAL)'],
    [],
    [
      'No',
      'Nama Siswa',
      'Kelas',
      'Pre Q1',
      'Pre Q2',
      'Pre Q3',
      'Pre Q4',
      'Pre Q5',
      'Total Pre',
      'Post Q1',
      'Post Q2',
      'Post Q3',
      'Post Q4',
      'Post Q5',
      'Total Post',
      'Kenaikan',
      'Status KKM',
    ],
  ];

  const sheet2Data = sorted.map((s, idx) => {
    const preAnswers = s.pretest_answers || {};
    const postAnswers = s.posttest_answers || {};

    const preQ1 = preAnswers['1']?.score ?? 0;
    const preQ2 = preAnswers['2']?.score ?? 0;
    const preQ3 = preAnswers['3']?.score ?? 0;
    const preQ4 = preAnswers['4']?.score ?? 0;
    const preQ5 = preAnswers['5']?.score ?? 0;
    const totalPre = s.pretest_score || 0;

    const postQ1 = postAnswers['1']?.score ?? 0;
    const postQ2 = postAnswers['2']?.score ?? 0;
    const postQ3 = postAnswers['3']?.score ?? 0;
    const postQ4 = postAnswers['4']?.score ?? 0;
    const postQ5 = postAnswers['5']?.score ?? 0;
    const totalPost = s.posttest_score || 0;

    const diff = totalPost - totalPre;

    return [
      idx + 1,
      s.student_name,
      s.class,
      preQ1,
      preQ2,
      preQ3,
      preQ4,
      preQ5,
      totalPre,
      postQ1,
      postQ2,
      postQ3,
      postQ4,
      postQ5,
      totalPost,
      `${diff >= 0 ? '+' : ''}${diff}%`,
      totalPost >= 75 ? 'Tuntas' : 'Remedial',
    ];
  });

  const ws2 = XLSX.utils.aoa_to_sheet([...sheet2Headers, ...sheet2Data]);
  ws2['!cols'] = [
    { wch: 5 },
    { wch: 28 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 11 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 11 },
    { wch: 12 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Rincian Per Soal');

  // Trigger browser download
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Rekap_Nilai_LKPD_Sistem_Pernapasan_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}
