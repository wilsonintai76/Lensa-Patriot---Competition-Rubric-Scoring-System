import React from 'react';
import { Film, Calendar, Clock, Award, ShieldCheck } from 'lucide-react';
import { RubricConfig } from '../types/rubric';

interface HeroSectionProps {
  rubric: RubricConfig;
  totalEntries: number;
  totalEvaluated: number;
  onStartScoring: () => void;
  onViewLeaderboard: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  rubric,
  totalEntries,
  totalEvaluated,
  onStartScoring,
  onViewLeaderboard
}) => {
  return (
    <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800 text-white mb-8">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Main Info Lockup */}
          <div className="max-w-3xl">
            {/* School identity kicker (clean unboxed text with separators) */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
              <span>{rubric.schoolName}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{rubric.motto}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Tarikh Tutup: 4 September 2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              {rubric.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-medium mb-4">
              Tema Rasmi: <span className="text-amber-300 font-semibold italic">"{rubric.theme}"</span>
            </p>

            {/* Unboxed metadata line */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Sasaran: 2:00 – 3:00 Minit (MP4 Landscape)
              </span>
              <span aria-hidden="true" className="text-slate-700">|</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Penilaian Skala Likert 1–5 & Semakan Syarat 3R
              </span>
              <span aria-hidden="true" className="text-slate-700">|</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Hadiah: RM200 / RM150 / RM100 Baucar Koperasi
              </span>
            </div>
          </div>

          {/* Quick Stats & Primary Action Deck */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-4 bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 p-4 rounded-xl">
            {/* School Crest Badge */}
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/badge_st_thomas_crest_1790836890958.jpg"
                alt="SMK St Thomas Crest"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg border border-amber-500/40 object-cover shadow"
              />
              <div>
                <div className="text-xs text-slate-400">Status Penilaian</div>
                <div className="text-lg font-mono font-bold text-white tabular-nums">
                  {totalEvaluated} / {totalEntries} <span className="text-xs text-slate-400 font-sans font-normal">Entri Dinilai</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onStartScoring}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow transition-colors whitespace-nowrap text-center"
              >
                Mula Menilai
              </button>
              <button
                onClick={onViewLeaderboard}
                className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded border border-slate-600 transition-colors whitespace-nowrap text-center"
              >
                Papan Pendahulu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
