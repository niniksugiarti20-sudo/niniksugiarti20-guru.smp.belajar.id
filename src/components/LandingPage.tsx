import { useState } from 'react';
import { GraduationCap, Users, Wind, ArrowRight, BookOpen, ClipboardCheck } from 'lucide-react';

type Role = 'guru' | 'murid' | null;

interface LandingPageProps {
  onSelectRole: (role: Role) => void;
}

export default function LandingPage({ onSelectRole }: LandingPageProps) {
  const [hovered, setHovered] = useState<Role>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary-500/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 backdrop-blur-md ring-1 ring-white/20">
            <Wind className="h-5 w-5 text-primary-300" />
            <span className="text-sm font-medium text-primary-100">STEM-based Learning</span>
          </div>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
            Sistem Pernapasan Manusia
            <span className="block bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">
              & PM2.5
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-100/80">
            Lembar Kerja Peserta Didik elektronik — Solusi Mengatasi Iritasi Tenggorokan Akibat
            PM2.5 Kabut Asap
          </p>
        </div>

        {/* Role selection cards */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 animate-slide-up">
          {/* Guru card */}
          <button
            onClick={() => onSelectRole('guru')}
            onMouseEnter={() => setHovered('guru')}
            onMouseLeave={() => setHovered(null)}
            className={`group card flex flex-col items-center p-8 text-center transition-all duration-300 hover:-translate-y-2 ${
              hovered === 'guru' ? 'ring-2 ring-primary-400' : ''
            }`}
          >
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 transition-transform duration-300 group-hover:scale-110">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">Dasbor Guru</h2>
            <p className="mb-4 text-slate-500">
              Masuk menggunakan token untuk melihat seluruh hasil pekerjaan siswa
            </p>
            <div className="mt-auto flex items-center gap-2 text-primary-600 font-semibold">
              <span>Masuk sebagai Guru</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Murid card */}
          <button
            onClick={() => onSelectRole('murid')}
            onMouseEnter={() => setHovered('murid')}
            onMouseLeave={() => setHovered(null)}
            className={`group card flex flex-col items-center p-8 text-center transition-all duration-300 hover:-translate-y-2 ${
              hovered === 'murid' ? 'ring-2 ring-secondary-400' : ''
            }`}
          >
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-700 shadow-lg shadow-secondary-500/30 transition-transform duration-300 group-hover:scale-110">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">Dasbor Murid</h2>
            <p className="mb-4 text-slate-500">
              Masuk dengan nama, kelas, dan kelompok untuk mengerjakan LKPD
            </p>
            <div className="mt-auto flex items-center gap-2 text-secondary-600 font-semibold">
              <span>Masuk sebagai Murid</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>

        {/* Activity overview */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-primary-100/60 animate-fade-in">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Pre-test</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-primary-100/30" />
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span>LKPD 1 & 2</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-primary-100/30" />
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span>Post-test</span>
          </div>
        </div>
      </div>
    </div>
  );
}
