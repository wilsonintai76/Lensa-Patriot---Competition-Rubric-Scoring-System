import React from 'react';
import { Award, FileText, Settings, Trophy, Video, Users, HelpCircle, Lock, ShieldCheck } from 'lucide-react';
import { Judge } from '../types/rubric';

interface HeaderProps {
  activeTab: 'scoring' | 'leaderboard' | 'customizer' | 'entries' | 'rules';
  setActiveTab: (tab: 'scoring' | 'leaderboard' | 'customizer' | 'entries' | 'rules') => void;
  judges: Judge[];
  activeJudgeId: string;
  setActiveJudgeId: (id: string) => void;
  onExportMasterPDF: () => void;
  verifiedJudgeIds?: string[];
  onOpenJudgePinModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  judges,
  activeJudgeId,
  setActiveJudgeId,
  onExportMasterPDF,
  verifiedJudgeIds = [],
  onOpenJudgePinModal
}) => {
  const activeJudge = judges.find((j) => j.id === activeJudgeId) || judges[0];
  const isVerified = verifiedJudgeIds.includes(activeJudge.id);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Title (Single text element wordmark in display face) */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
              LP
            </div>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('scoring');
              }}
              className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors"
            >
              Lensa Patriot
            </a>
          </div>

          {/* Zone 2: Navigation Links (Clean text links with hover underline / active state) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('scoring')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                activeTab === 'scoring'
                  ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Borang Pemarkahan</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Papan Pendahulu</span>
            </button>

            <button
              onClick={() => setActiveTab('customizer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                activeTab === 'customizer'
                  ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Urus Rubrik</span>
            </button>

            <button
              onClick={() => setActiveTab('entries')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                activeTab === 'entries'
                  ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Senarai Entri</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                activeTab === 'rules'
                  ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Syarat & Hadiah</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Judge Switcher & Master PDF Export) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Judge Selector Control */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded px-2.5 py-1 text-xs">
              <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <span>Hakim Aktif:</span>
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
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {judges.map((j) => {
                    const jVerified = verifiedJudgeIds.includes(j.id);
                    return (
                      <option key={j.id} value={j.id} className="bg-slate-900 text-white">
                        {j.name} ({j.role}) {jVerified ? '✓' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Quick Export Master PDF */}
            <button
              onClick={onExportMasterPDF}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded shadow-sm transition-colors whitespace-nowrap"
              title="Eksport Papan Keputusan ke PDF Rasmi"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eksport PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('scoring')}
            className={`px-2 py-1 ${activeTab === 'scoring' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            Pemarkahan
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-2 py-1 ${activeTab === 'leaderboard' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('customizer')}
            className={`px-2 py-1 ${activeTab === 'customizer' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            Rubrik
          </button>
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-2 py-1 ${activeTab === 'entries' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            Entri
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-2 py-1 ${activeTab === 'rules' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            Syarat
          </button>
        </div>
      </div>
    </header>
  );
};
