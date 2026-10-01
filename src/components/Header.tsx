import React from 'react';
import {
  GraduationCap,
  Scale,
  ShieldAlert,
  Users,
  Lock,
  ShieldCheck,
  Download,
  HelpCircle,
  Settings
} from 'lucide-react';
import { AppRole, Judge } from '../types/rubric';

interface HeaderProps {
  activeRole: AppRole;
  setActiveRole: (role: AppRole) => void;
  judges: Judge[];
  activeJudgeId: string;
  setActiveJudgeId: (id: string) => void;
  onExportMasterPDF: () => void;
  verifiedJudgeIds?: string[];
  onOpenJudgePinModal?: () => void;
  onOpenRulesModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  setActiveRole,
  judges,
  activeJudgeId,
  setActiveJudgeId,
  onExportMasterPDF,
  verifiedJudgeIds = [],
  onOpenJudgePinModal,
  onOpenRulesModal
}) => {
  const activeJudge = judges.find((j) => j.id === activeJudgeId) || judges[0];
  const isVerified = verifiedJudgeIds.includes(activeJudge.id);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-base shadow-inner">
              LP
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>Lensa Patriot</span>
                <span className="text-[10px] uppercase font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded">
                  SMK St. Thomas
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Sistem Pemarkahan & Rubrik Digital
              </p>
            </div>
          </div>

          {/* Zone 2: Distinct 3-Role Navigation Switcher */}
          <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveRole('peserta')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'peserta'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Peserta</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('hakim')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'hakim'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Hakim</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('penganjur')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'penganjur'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Penganjur</span>
            </button>
          </nav>

          {/* Zone 3: Role-Specific Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {activeRole === 'hakim' && (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
                <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <span>Hakim:</span>
                    {isVerified ? (
                      <span className="text-[10px] text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Disahkan
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenJudgePinModal}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-0.5 underline cursor-pointer"
                      >
                        <Lock className="w-2.5 h-2.5" /> Perlu PIN
                      </button>
                    )}
                  </span>
                  <select
                    value={activeJudgeId}
                    onChange={(e) => setActiveJudgeId(e.target.value)}
                    className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-1 text-xs"
                  >
                    {judges.map((j) => (
                      <option key={j.id} value={j.id} className="bg-slate-900 text-white">
                        {j.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeRole === 'penganjur' && (
              <button
                type="button"
                onClick={onExportMasterPDF}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Eksport PDF</span>
              </button>
            )}

            {activeRole === 'peserta' && onOpenRulesModal && (
              <button
                type="button"
                onClick={onOpenRulesModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Syarat & Hadiah</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
