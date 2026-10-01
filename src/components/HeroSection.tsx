import React from 'react';
import { Film, Calendar, Clock, Award, ShieldCheck, GraduationCap, Scale, Settings } from 'lucide-react';
import { AppRole, RubricConfig } from '../types/rubric';

interface HeroSectionProps {
  rubric: RubricConfig;
  totalEntries: number;
  totalEvaluated: number;
  activeRole: AppRole;
  onSelectRole: (role: AppRole) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  rubric,
  totalEntries,
  totalEvaluated,
  activeRole,
  onSelectRole
}) => {
  return (
    <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800 text-white mb-6">
      {/* Background Cinematic Image with measured gradient scrim */}
      <div className="absolute inset-0 z-0 opacity-25">
        <img
          src="/src/assets/images/hero_lensa_patriot_1790836880683.jpg"
          alt="Lensa Patriot Cinematic Reel"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Main Info Lockup */}
          <div className="max-w-3xl">
            {/* School identity kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
              <span>{rubric.schoolName}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{rubric.motto}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Bulan Kebangsaan 2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-1.5 leading-tight">
              {rubric.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium mb-3">
              Tema Rasmi: <span className="text-amber-300 font-semibold italic">"{rubric.theme}"</span>
            </p>

            {/* Metadata line */}
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Sasaran: 2:00 – 3:00 Minit (Buffer 1:45 – 3:15)
              </span>
              <span aria-hidden="true" className="text-slate-700">|</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Skala Likert 1–5 & Semakan 3R
              </span>
              <span aria-hidden="true" className="text-slate-700">|</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Baucar Koperasi RM200 / RM150 / RM100
              </span>
            </div>
          </div>

          {/* Quick Portal Switcher & Crest Deck */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 bg-slate-800/70 backdrop-blur-sm border border-slate-700/60 p-4 rounded-xl shadow-md">
            {/* School Crest Badge */}
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/badge_st_thomas_crest_1790836890958.jpg"
                alt="SMK St Thomas Crest"
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-lg border border-amber-500/40 object-cover shadow"
              />
              <div>
                <div className="text-[11px] text-slate-400">Status Keseluruhan</div>
                <div className="text-base font-mono font-bold text-white tabular-nums">
                  {totalEvaluated} / {totalEntries} <span className="text-xs text-slate-400 font-sans font-normal">Entri Dinilai</span>
                </div>
              </div>
            </div>

            {/* Quick 3-Portal Switch Buttons */}
            <div className="grid grid-cols-3 gap-1.5 w-full pt-1">
              <button
                type="button"
                onClick={() => onSelectRole('peserta')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeRole === 'peserta'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>Peserta</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('hakim')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeRole === 'hakim'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Scale className="w-3 h-3" />
                <span>Hakim</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('penganjur')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeRole === 'penganjur'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Settings className="w-3 h-3" />
                <span>Penganjur</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
