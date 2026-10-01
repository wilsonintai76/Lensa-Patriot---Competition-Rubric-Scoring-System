import React, { useState, useEffect } from 'react';
import { AppRole, RubricConfig, Entry, Judge, Scorecard } from './types/rubric';
import {
  DEFAULT_RUBRIC_CONFIG,
  DEFAULT_JUDGES,
  INITIAL_ENTRIES,
  INITIAL_SCORECARDS
} from './data/defaultData';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PesertaPortal } from './components/portals/PesertaPortal';
import { HakimPortal } from './components/portals/HakimPortal';
import { PenganjurPortal } from './components/portals/PenganjurPortal';
import { RulesModal } from './components/RulesModal';
import { JudgePinModal } from './components/JudgePinModal';
import { exportLeaderboardPDF } from './utils/pdfExport';

export default function App() {
  // Active Role State: 'peserta' | 'hakim' | 'penganjur'
  const [activeRole, setActiveRole] = useState<AppRole>(() => {
    try {
      const saved = localStorage.getItem('lp_active_role');
      if (saved === 'peserta' || saved === 'hakim' || saved === 'penganjur') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'peserta';
  });

  const handleSelectRole = (role: AppRole) => {
    setActiveRole(role);
    try {
      localStorage.setItem('lp_active_role', role);
    } catch (e) {
      console.warn(e);
    }
  };

  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isHeaderPinModalOpen, setIsHeaderPinModalOpen] = useState(false);

  // App Data with localStorage persistence
  const [rubric, setRubric] = useState<RubricConfig>(() => {
    try {
      const saved = localStorage.getItem('lp_rubric_config');
      return saved ? JSON.parse(saved) : DEFAULT_RUBRIC_CONFIG;
    } catch {
      return DEFAULT_RUBRIC_CONFIG;
    }
  });

  const [judges, setJudges] = useState<Judge[]>(() => {
    try {
      const saved = localStorage.getItem('lp_judges');
      return saved ? JSON.parse(saved) : DEFAULT_JUDGES;
    } catch {
      return DEFAULT_JUDGES;
    }
  });

  // Track verified judges in session
  const [verifiedJudgeIds, setVerifiedJudgeIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('lp_verified_judges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleVerifyJudge = (judgeId: string) => {
    setVerifiedJudgeIds((prev) => {
      if (prev.includes(judgeId)) return prev;
      const next = [...prev, judgeId];
      try {
        sessionStorage.setItem('lp_verified_judges', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const [entries, setEntries] = useState<Entry[]>(() => {
    try {
      const saved = localStorage.getItem('lp_entries');
      return saved ? JSON.parse(saved) : INITIAL_ENTRIES;
    } catch {
      return INITIAL_ENTRIES;
    }
  });

  const [scorecards, setScorecards] = useState<Scorecard[]>(() => {
    try {
      const saved = localStorage.getItem('lp_scorecards');
      return saved ? JSON.parse(saved) : INITIAL_SCORECARDS;
    } catch {
      return INITIAL_SCORECARDS;
    }
  });

  const [activeJudgeId, setActiveJudgeId] = useState<string>(() => {
    return judges[0]?.id || 'judge-1';
  });

  const [activeEntryId, setActiveEntryId] = useState<string>(() => {
    return entries[0]?.id || 'entry-a01';
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lp_rubric_config', JSON.stringify(rubric));
    } catch (e) {
      console.warn('Could not save rubric to localStorage', e);
    }
  }, [rubric]);

  useEffect(() => {
    try {
      localStorage.setItem('lp_judges', JSON.stringify(judges));
    } catch (e) {
      console.warn('Could not save judges to localStorage', e);
    }
  }, [judges]);

  useEffect(() => {
    try {
      localStorage.setItem('lp_entries', JSON.stringify(entries));
    } catch (e) {
      console.warn('Could not save entries to localStorage', e);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem('lp_scorecards', JSON.stringify(scorecards));
    } catch (e) {
      console.warn('Could not save scorecards to localStorage', e);
    }
  }, [scorecards]);

  // Check for scanned QR code URL params on load (?code=VID-A01 or ?entry=entry-id)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get('code');
      const entryParam = urlParams.get('entry');
      const roleParam = urlParams.get('role');

      if (codeParam || entryParam) {
        const found = entries.find(
          (e) =>
            (codeParam && e.code.toLowerCase() === codeParam.toLowerCase()) ||
            (entryParam && e.id.toLowerCase() === entryParam.toLowerCase())
        );

        if (found) {
          setActiveEntryId(found.id);
          if (roleParam === 'hakim' || !roleParam) {
            handleSelectRole('hakim');
          }
        }
      }
    } catch (e) {
      console.warn('Failed parsing URL QR params', e);
    }
  }, [entries]);

  // Handler: Save or Update Scorecard
  const handleSaveScorecard = (updatedScorecard: Scorecard) => {
    setScorecards((prev) => {
      const existingIdx = prev.findIndex(
        (sc) =>
          sc.entryId === updatedScorecard.entryId &&
          sc.judgeId === updatedScorecard.judgeId
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = updatedScorecard;
        return next;
      }
      return [...prev, updatedScorecard];
    });
  };

  // Handler: Add Entry
  const handleAddEntry = (newEntry: Entry) => {
    setEntries((prev) => [...prev, newEntry]);
    setActiveEntryId(newEntry.id);
  };

  // Handler: Update Entry
  const handleUpdateEntry = (updatedEntry: Entry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
  };

  // Handler: Delete Entry
  const handleDeleteEntry = (entryId: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    setScorecards((prev) => prev.filter((sc) => sc.entryId !== entryId));
    if (activeEntryId === entryId) {
      const remaining = entries.filter((e) => e.id !== entryId);
      if (remaining.length > 0) {
        setActiveEntryId(remaining[0].id);
      }
    }
  };

  // Handler: Update Rubric Configuration
  const handleUpdateRubric = (newRubric: RubricConfig) => {
    setRubric(newRubric);
  };

  // Trigger Master PDF Export
  const handleExportMasterPDF = () => {
    const rows = entries.map((entry, idx) => {
      const entryScorecards = scorecards.filter((sc) => sc.entryId === entry.id);
      const judgeCount = entryScorecards.length;
      const isDisqualified = entryScorecards.some((sc) => sc.isDisqualified);
      const disqualificationReason = entryScorecards.find((sc) => sc.isDisqualified)?.disqualificationReason;

      const totalGross = entryScorecards.reduce((sum, sc) => sum + sc.grossScore, 0);
      const totalPenalty = entryScorecards.reduce((sum, sc) => sum + sc.durationPenalty, 0);
      const totalFinal = entryScorecards.reduce((sum, sc) => sum + sc.finalScore, 0);

      const criteriaAverages: Record<string, number> = {};
      rubric.criteria.forEach((crit) => {
        const critTotal = entryScorecards.reduce(
          (sum, sc) => sum + (sc.criteriaScores[crit.id] || 0) * crit.multiplier,
          0
        );
        criteriaAverages[crit.id] = judgeCount > 0 ? critTotal / judgeCount : 0;
      });

      return {
        entry,
        category: entry.category,
        judgeCount,
        avgGrossScore: judgeCount > 0 ? totalGross / judgeCount : 0,
        avgPenalty: judgeCount > 0 ? totalPenalty / judgeCount : 0,
        avgFinalScore: isDisqualified ? 0 : judgeCount > 0 ? totalFinal / judgeCount : 0,
        criteriaAverages,
        isDisqualified,
        disqualificationReason,
        rank: idx + 1,
        scorecards: entryScorecards
      };
    });

    // Sort by final score
    rows.sort((a, b) => {
      if (a.isDisqualified && !b.isDisqualified) return 1;
      if (!a.isDisqualified && b.isDisqualified) return -1;
      return b.avgFinalScore - a.avgFinalScore;
    });

    // Re-assign rank
    rows.forEach((r, i) => {
      r.rank = r.isDisqualified || r.judgeCount === 0 ? 0 : i + 1;
    });

    exportLeaderboardPDF(rows, 'Semua Kategori', rubric, judges);
  };

  const totalEvaluated = entries.filter((e) =>
    scorecards.some((sc) => sc.entryId === e.id)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Navigation with Distinct 3-Role Switcher */}
      <Header
        activeRole={activeRole}
        setActiveRole={handleSelectRole}
        judges={judges}
        activeJudgeId={activeJudgeId}
        setActiveJudgeId={setActiveJudgeId}
        onExportMasterPDF={handleExportMasterPDF}
        verifiedJudgeIds={verifiedJudgeIds}
        onOpenJudgePinModal={() => setIsHeaderPinModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
      />

      {/* Cinematic Hero Section with Quick Portal Switcher */}
      <HeroSection
        rubric={rubric}
        totalEntries={entries.length}
        totalEvaluated={totalEvaluated}
        activeRole={activeRole}
        onSelectRole={handleSelectRole}
      />

      {/* Main Role-Specific Distinct Portals */}
      <main className="flex-1 pb-12">
        {/* ROLE 1: PORTAL PESERTA */}
        {activeRole === 'peserta' && (
          <PesertaPortal
            entries={entries}
            rubric={rubric}
            scorecards={scorecards}
            onOpenRules={() => setIsRulesModalOpen(true)}
            onAddEntry={handleAddEntry}
            onOpenInJudgeView={(entryId) => {
              setActiveEntryId(entryId);
              handleSelectRole('hakim');
            }}
          />
        )}

        {/* ROLE 2: PORTAL HAKIM */}
        {activeRole === 'hakim' && (
          <HakimPortal
            entries={entries}
            activeEntryId={activeEntryId}
            setActiveEntryId={setActiveEntryId}
            judges={judges}
            activeJudgeId={activeJudgeId}
            setActiveJudgeId={setActiveJudgeId}
            rubric={rubric}
            scorecards={scorecards}
            onSaveScorecard={handleSaveScorecard}
            onOpenRules={() => setIsRulesModalOpen(true)}
            verifiedJudgeIds={verifiedJudgeIds}
            onVerifyJudge={handleVerifyJudge}
            onOpenJudgePinModal={() => setIsHeaderPinModalOpen(true)}
          />
        )}

        {/* ROLE 3: PORTAL PENGANJUR / PENTADBIR */}
        {activeRole === 'penganjur' && (
          <PenganjurPortal
            entries={entries}
            judges={judges}
            rubric={rubric}
            scorecards={scorecards}
            onAddEntry={handleAddEntry}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
            onUpdateRubric={handleUpdateRubric}
            onScoreEntry={(entryId) => {
              setActiveEntryId(entryId);
              setActiveRole('hakim');
            }}
            onExportMasterPDF={handleExportMasterPDF}
            verifiedJudgeIds={verifiedJudgeIds}
          />
        )}
      </main>

      {/* Rules & Guidelines Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rubric={rubric}
      />

      {/* Header-triggered Judge Security PIN Modal */}
      {(() => {
        const activeJudge = judges.find((j) => j.id === activeJudgeId) || judges[0];
        return (
          <JudgePinModal
            isOpen={isHeaderPinModalOpen}
            onClose={() => setIsHeaderPinModalOpen(false)}
            judge={activeJudge}
            allJudges={judges}
            onSelectDifferentJudge={(newJudgeId) => {
              setActiveJudgeId(newJudgeId);
            }}
            onSuccess={() => {
              handleVerifyJudge(activeJudge.id);
              setIsHeaderPinModalOpen(false);
            }}
            actionDescription="mengesahkan identiti anda sebagai hakim rasmi pertandingan"
          />
        );
      })()}

      {/* Editorial Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 mt-auto text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">
              {rubric.schoolName}
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Sistem Pemarkahan & Rubrik Digital Pertandingan</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>Urusetia: Pn. Gwen & Cg. Ajien</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Kuching, Sarawak</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
