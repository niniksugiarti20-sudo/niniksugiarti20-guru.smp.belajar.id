import { TrendingUp, BarChart3, PieChart, Award } from 'lucide-react';

interface Submission {
  id: string;
  student_name: string;
  class: string;
  group_number: number;
  group_name: string | null;
  pretest_score: number;
  posttest_score: number;
  total_score: number;
  status: string;
  lkpd2_data: Record<string, unknown> | null;
}

const PRETEST_MAX = 100;
const POSTTEST_MAX = 100;

interface OrganolepticRow {
  label: string;
  rasa: string;
  aroma: string;
  tekstur: string;
  warna: string;
  nyaman: string;
  total: string;
}

const criteriaLabels = [
  { key: 'rasa', label: 'Rasa' },
  { key: 'aroma', label: 'Aroma' },
  { key: 'tekstur', label: 'Tekstur' },
  { key: 'warna', label: 'Warna' },
  { key: 'nyaman', label: 'Nyaman Tenggorokan' },
] as const;

const formulaColors = [
  { bar: 'bg-secondary-500', dot: 'bg-secondary-500', ring: 'ring-secondary-200', text: 'text-secondary-600', bg: 'bg-secondary-50' },
  { bar: 'bg-primary-500', dot: 'bg-primary-500', ring: 'ring-primary-200', text: 'text-primary-600', bg: 'bg-primary-50' },
  { bar: 'bg-accent-500', dot: 'bg-accent-500', ring: 'ring-accent-200', text: 'text-accent-600', bg: 'bg-accent-50' },
  { bar: 'bg-rose-500', dot: 'bg-rose-500', ring: 'ring-rose-200', text: 'text-rose-600', bg: 'bg-rose-50' },
];

export function PrePostComparisonChart({ submissions }: { submissions: Submission[] }) {
  const completed = submissions.filter((s) => s.status === 'completed');

  if (completed.length === 0) {
    return (
      <div className="card p-6">
        <ChartHeader
          icon={TrendingUp}
          title="Perbandingan Pre-test vs Post-test"
          subtitle="Grafik belum tersedia — menunggu siswa menyelesaikan LKPD"
        />
        <div className="flex items-center justify-center py-10 text-slate-400">
          <BarChart3 className="h-10 w-10 opacity-40" />
        </div>
      </div>
    );
  }

  const avgPretestRaw =
    completed.length > 0
      ? completed.reduce((sum, s) => sum + (s.pretest_score || 0), 0) / completed.length
      : 0;
  const avgPosttestRaw =
    completed.length > 0
      ? completed.reduce((sum, s) => sum + (s.posttest_score || 0), 0) / completed.length
      : 0;

  const avgPretest = Math.round((avgPretestRaw / PRETEST_MAX) * 100);
  const avgPosttest = Math.round((avgPosttestRaw / POSTTEST_MAX) * 100);
  const improvement = avgPosttest - avgPretest;

  return (
    <div className="card p-6">
      <ChartHeader
        icon={TrendingUp}
        title="Perbandingan Pre-test vs Post-test"
        subtitle={`Rata-rata dari ${completed.length} siswa yang telah selesai`}
      />

      {/* Summary bars with average values */}
      <div className="mb-6 space-y-4">
        <PercentBar
          label="Pre-test"
          percent={avgPretest}
          color="bg-secondary-500"
          value={`Rata-rata: ${avgPretestRaw.toFixed(1)}/${PRETEST_MAX} (${avgPretest}%)`}
        />
        <PercentBar
          label="Post-test"
          percent={avgPosttest}
          color="bg-primary-500"
          value={`Rata-rata: ${avgPosttestRaw.toFixed(1)}/${POSTTEST_MAX} (${avgPosttest}%)`}
        />
      </div>

      {/* Improvement badge */}
      <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald-50 p-3.5 text-emerald-800 border border-emerald-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-bold">
            Kenaikan Skor: +{improvement}%
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
          Naik KKM (19%)
        </span>
      </div>

      {/* Per-student breakdown */}
      <div className="border-t border-slate-100 pt-4">
        <p className="mb-3 text-sm font-semibold text-slate-600">Detail per Siswa</p>
        <div className="space-y-3">
          {completed.map((s) => {
            const prePct = Math.round(((s.pretest_score || 0) / PRETEST_MAX) * 100);
            const postPct = Math.round(((s.posttest_score || 0) / POSTTEST_MAX) * 100);
            return (
              <div key={s.id} className="space-y-1.5">
                <p className="text-xs font-medium text-slate-600">{s.student_name}</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-secondary-400 transition-all duration-700"
                      style={{ width: `${prePct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold text-secondary-600">
                    {prePct}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-700"
                      style={{ width: `${postPct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold text-primary-600">
                    {postPct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-secondary-500" />
          <span className="text-xs text-slate-500">Pre-test</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary-500" />
          <span className="text-xs text-slate-500">Post-test</span>
        </div>
      </div>
    </div>
  );
}

export function OrganolepticOverviewChart({ submissions }: { submissions: Submission[] }) {
  const withLkpd2 = submissions.filter((s) => {
    const d = s.lkpd2_data;
    return d && d.scores && Array.isArray(d.scores) && (d.scores as OrganolepticRow[]).length > 0;
  });

  if (withLkpd2.length === 0) {
    return (
      <div className="card p-6">
        <ChartHeader
          icon={PieChart}
          title="Grafik Uji Organoleptik"
          subtitle="Grafik belum tersedia — menunggu data LKPD 2"
        />
        <div className="flex items-center justify-center py-10 text-slate-400">
          <PieChart className="h-10 w-10 opacity-40" />
        </div>
      </div>
    );
  }

  const formulaNames: string[] = [];
  withLkpd2.forEach((s) => {
    const rows = s.lkpd2_data!.scores as OrganolepticRow[];
    rows.forEach((row) => {
      if (!formulaNames.includes(row.label)) formulaNames.push(row.label);
    });
  });

  const formulaData = formulaNames.map((formulaName) => {
    const criteriaAvgs = criteriaLabels.map((crit) => {
      const vals: number[] = [];
      withLkpd2.forEach((s) => {
        const rows = s.lkpd2_data!.scores as OrganolepticRow[];
        const row = rows.find((r) => r.label === formulaName);
        if (row) {
          const val = parseInt(row[crit.key]) || 0;
          if (val > 0) vals.push(val);
        }
      });
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      const percent = Math.round((avg / 5) * 100);
      return { ...crit, avg: Math.round(avg * 10) / 10, percent };
    });
    const avgOfAvgs =
      criteriaAvgs.reduce((sum, c) => sum + c.avg, 0) / criteriaAvgs.length;
    const totalPercent = Math.round((avgOfAvgs / 5) * 100);
    return {
      formulaName,
      criteria: criteriaAvgs,
      totalPercent,
      avgOfAvgs: Math.round(avgOfAvgs * 100) / 100,
    };
  });

  const bestFormula = [...formulaData].sort((a, b) => b.totalPercent - a.totalPercent)[0];
  const bestIndex = formulaData.findIndex((f) => f.formulaName === bestFormula.formulaName);

  return (
    <div className="card p-6">
      <ChartHeader
        icon={PieChart}
        title="Grafik Uji Organoleptik"
        subtitle={`Formula 1, 2, 3 & Racikan Sendiri — rata-rata dari ${withLkpd2.length} kelompok`}
      />

      {/* Legend */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {formulaData.map((f, fi) => (
          <div key={fi} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${formulaColors[fi % 4].dot}`} />
            <span className="text-xs font-medium text-slate-600">{f.formulaName}</span>
          </div>
        ))}
      </div>

      {/* Unified grouped bar chart */}
      <div className="space-y-5">
        {formulaData.map((f, fi) => {
          const color = formulaColors[fi % 4];
          return (
            <div key={fi} className={`rounded-xl ${color.bg} p-4`}>
              {/* Formula header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${color.dot}`} />
                  <span className="text-sm font-bold text-slate-700">{f.formulaName}</span>
                </div>
                <span className={`rounded-lg bg-white px-2.5 py-0.5 text-xs font-bold ${color.text}`}>
                  Rata-rata: {f.avgOfAvgs.toFixed(2)} / 5.00 ({f.totalPercent}%)
                </span>
              </div>

              {/* Criteria bars */}
              <div className="space-y-2">
                {f.criteria.map((c) => (
                  <div key={c.key} className="flex items-center gap-3">
                    <span className="w-28 flex-shrink-0 text-xs text-slate-600">{c.label}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/60">
                      <div
                        className={`h-full rounded-full ${color.bar} transition-all duration-700`}
                        style={{ width: `${c.percent}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-xs font-semibold text-slate-600">
                      {c.avg.toFixed(1)}/5 ({c.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Best formula conclusion */}
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-5 text-white shadow-lg shadow-primary-500/20">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-bold text-white">Kesimpulan: Formula Terbaik</h4>
          <p className="mt-1 text-sm text-white/90">
            <strong className="text-white">{bestFormula.formulaName}</strong> mendapatkan nilai
            rata-rata tertinggi sebesar{' '}
            <strong className="text-white">{bestFormula.avgOfAvgs.toFixed(2)}/5.00</strong>{' '}
            ({bestFormula.totalPercent}%) dari hasil uji organoleptik semua kelompok.
          </p>
        </div>
        <div className={`ml-auto hidden h-3 w-3 flex-shrink-0 rounded-full ${formulaColors[bestIndex % 4].dot} sm:block`} />
      </div>
    </div>
  );
}

export function OrganolepticStudentChart({
  lkpd2Data,
}: {
  lkpd2Data: Record<string, unknown> | null;
}) {
  if (!lkpd2Data || !lkpd2Data.scores || !Array.isArray(lkpd2Data.scores)) return null;

  const rows = lkpd2Data.scores as OrganolepticRow[];
  const hasData = rows.some(
    (r) => r.rasa || r.aroma || r.tekstur || r.warna || r.nyaman
  );
  if (!hasData) return null;

  return (
    <div className="rounded-xl border-2 border-slate-100 bg-slate-50/50 p-4">
      <div className="mb-4 flex items-center gap-2">
        <PieChart className="h-5 w-5 text-primary-500" />
        <h5 className="text-sm font-bold text-slate-700">
          Grafik Uji Organoleptik (Persentase)
        </h5>
      </div>

      <div className="space-y-4">
        {rows.map((row, i) => {
          const criteria = criteriaLabels.map((c) => {
            const val = parseInt(row[c.key]) || 0;
            return { ...c, val, percent: Math.round((val / 5) * 100) };
          });
          const avgOfVals =
            criteria.reduce((sum, c) => sum + c.val, 0) / criteria.length;
          const totalPct = Math.round((avgOfVals / 5) * 100);

          const color = formulaColors[i % 4];

          return (
            <div
              key={i}
              className={`rounded-xl bg-white p-4 ring-1 ${color.ring}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${color.dot}`} />
                  <span className="text-sm font-semibold text-slate-700">{row.label}</span>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                    totalPct >= 80
                      ? 'bg-primary-100 text-primary-700'
                      : totalPct >= 60
                        ? 'bg-accent-100 text-accent-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Rata-rata: {avgOfVals.toFixed(2)}/5.00 ({totalPct}%)
                </span>
              </div>
              <div className="space-y-2">
                {criteria.map((c) => (
                  <div key={c.key} className="flex items-center gap-3">
                    <span className="w-28 flex-shrink-0 text-xs text-slate-500">
                      {c.label}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${color.bar} transition-all duration-700`}
                        style={{ width: `${c.percent}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-xs font-semibold text-slate-600">
                      {c.val}/5 ({c.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PrePostStudentChart({
  pretestScore,
  posttestScore,
}: {
  pretestScore: number;
  posttestScore: number;
}) {
  const prePct = Math.round(((pretestScore || 0) / PRETEST_MAX) * 100);
  const postPct = Math.round(((posttestScore || 0) / POSTTEST_MAX) * 100);
  const improvement = postPct - prePct;

  return (
    <div className="rounded-xl border-2 border-slate-100 bg-slate-50/50 p-4">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary-500" />
        <h5 className="text-sm font-bold text-slate-700">
          Grafik Perbandingan Pre-test vs Post-test
        </h5>
      </div>

      <div className="space-y-3">
        <PercentBar
          label="Pre-test"
          percent={prePct}
          color="bg-secondary-500"
          value={`${pretestScore || 0}/${PRETEST_MAX} (${prePct}%)`}
        />
        <PercentBar
          label="Post-test"
          percent={postPct}
          color="bg-primary-500"
          value={`${posttestScore || 0}/${POSTTEST_MAX} (${postPct}%)`}
        />
      </div>

      {improvement !== 0 && (
        <div
          className={`mt-4 flex items-center justify-between rounded-xl p-3 ${
            improvement > 0
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold">
              {improvement > 0
                ? `Kenaikan Skor: +${improvement}%`
                : `Penurunan: ${improvement}%`}
            </span>
          </div>
          {improvement > 0 && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
              Naik KKM
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ChartHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof TrendingUp;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <h3 className="font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function PercentBar({
  label,
  percent,
  color,
  value,
}: {
  label: string;
  percent: number;
  color: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-600">{value}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
