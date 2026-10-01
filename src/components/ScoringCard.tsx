import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Info,
  Lock,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  KeyRound,
  Zap
} from 'lucide-react';
import { Entry, Judge, RubricConfig, Scorecard, ScorecardDraft } from '../types/rubric';
import { calculateDurationPenalty, calculateGrossScore } from '../data/defaultData';
import { exportScorecardPDF } from '../utils/pdfExport';
import { JudgePinModal } from './JudgePinModal';

interface ScoringCardProps {
  entries: Entry[];
  activeEntryId: string;
  setActiveEntryId: (id: string) => void;
  judges: Judge[];
  activeJudgeId: string;
  setActiveJudgeId?: (id: string) => void;
  rubric: RubricConfig;
  scorecards: Scorecard[];
  onSaveScorecard: (scorecard: Scorecard) => void;
  onOpenRules: () => void;
  verifiedJudgeIds: string[];
  onVerifyJudge: (judgeId: string) => void;
}

export const ScoringCard: React.FC<ScoringCardProps> = ({
  entries,
  activeEntryId,
  setActiveEntryId,
  judges,
  activeJudgeId,
  setActiveJudgeId,
  rubric,
  scorecards,
  onSaveScorecard,
  onOpenRules,
  verifiedJudgeIds,
  onVerifyJudge
}) => {
  const currentEntryIndex = entries.findIndex((e) => e.id === activeEntryId);
  const currentEntry = entries[currentEntryIndex] || entries[0];
  const currentJudge = judges.find((j) => j.id === activeJudgeId) || judges[0];

  const isCurrentJudgeVerified = verifiedJudgeIds.includes(currentJudge.id);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingSaveMode, setPendingSaveMode] = useState<'save' | 'lock' | null>(null);

  // Find existing scorecard or create initial state
  const existingScorecard = scorecards.find(
    (sc) => sc.entryId === currentEntry.id && sc.judgeId === currentJudge.id
  );

  // Local state for editing
  const [gatekeeperStatus, setGatekeeperStatus] = useState<Record<string, boolean>>(() => {
    if (existingScorecard) return existingScorecard.gatekeeperStatus;
    const initial: Record<string, boolean> = {};
    rubric.gatekeepers.forEach((gk) => {
      initial[gk.id] = true; // default passed
    });
    return initial;
  });

  const [scores, setScores] = useState<Record<string, number>>(() => {
    if (existingScorecard) return existingScorecard.criteriaScores;
    try {
      const rawDraft = localStorage.getItem(`lp_draft_${currentEntry.id}_${currentJudge.id}`);
      if (rawDraft) {
        const d = JSON.parse(rawDraft);
        if (d.criteriaScores) return d.criteriaScores;
      }
    } catch (e) {
      console.warn(e);
    }
    return {};
  });

  const [durationMin, setDurationMin] = useState<number>(
    existingScorecard ? existingScorecard.actualDurationMin : currentEntry.actualDurationMin
  );
  const [durationSec, setDurationSec] = useState<number>(
    existingScorecard ? existingScorecard.actualDurationSec : currentEntry.actualDurationSec
  );

  const [strengths, setStrengths] = useState<string>(
    existingScorecard ? existingScorecard.qualitativeFeedback.strengths : ''
  );
  const [improvements, setImprovements] = useState<string>(
    existingScorecard ? existingScorecard.qualitativeFeedback.improvements : ''
  );

  const [isLocked, setIsLocked] = useState<boolean>(
    existingScorecard ? existingScorecard.isLocked : false
  );

  // Manual Disqualification State
  const [isManuallyDisqualified, setIsManuallyDisqualified] = useState<boolean>(() => {
    if (existingScorecard) return existingScorecard.isDisqualified;
    try {
      const rawDraft = localStorage.getItem(`lp_draft_${currentEntry.id}_${currentJudge.id}`);
      if (rawDraft) {
        const d = JSON.parse(rawDraft);
        if (typeof d.isDisqualified === 'boolean') return d.isDisqualified;
      }
    } catch (e) {
      console.warn(e);
    }
    return false;
  });
  const [manualDisqualifyReason, setManualDisqualifyReason] = useState<string>(() => {
    if (existingScorecard?.disqualificationReason) return existingScorecard.disqualificationReason;
    return 'Pelanggaran syarat pertandingan / isu 3R';
  });

  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Draft state & key
  const draftKey = `lp_draft_${currentEntry.id}_${currentJudge.id}`;
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string | null>(null);
  const [draftRestoredMessage, setDraftRestoredMessage] = useState<string | null>(null);

  // Progress Calculations for Rated Criteria
  const totalCriteria = rubric.criteria.length;
  const ratedCriteriaCount = rubric.criteria.filter(
    (crit) => typeof scores[crit.id] === 'number' && scores[crit.id] > 0
  ).length;
  const progressPercent = totalCriteria > 0
    ? Math.round((ratedCriteriaCount / totalCriteria) * 100)
    : 0;
  const isAllCriteriaRated = ratedCriteriaCount === totalCriteria && totalCriteria > 0;

  // Sync state whenever activeEntry or activeJudge changes
  useEffect(() => {
    const sc = scorecards.find(
      (s) => s.entryId === currentEntry.id && s.judgeId === currentJudge.id
    );

    // Check for localStorage draft
    let foundDraft: ScorecardDraft | null = null;
    try {
      const rawDraft = localStorage.getItem(draftKey);
      if (rawDraft) {
        foundDraft = JSON.parse(rawDraft);
      }
    } catch (e) {
      console.warn('Error reading draft from localStorage', e);
    }

    if (foundDraft && (!sc || !sc.isLocked)) {
      // Restore draft
      setGatekeeperStatus(foundDraft.gatekeeperStatus || {});
      setScores(foundDraft.criteriaScores || {});
      setDurationMin(foundDraft.durationMin ?? currentEntry.actualDurationMin);
      setDurationSec(foundDraft.durationSec ?? currentEntry.actualDurationSec);
      setStrengths(foundDraft.strengths || '');
      setImprovements(foundDraft.improvements || '');
      setIsManuallyDisqualified(foundDraft.isDisqualified ?? false);
      setManualDisqualifyReason(foundDraft.disqualificationReason || 'Pelanggaran syarat pertandingan / isu 3R');
      setIsLocked(false);
      setLastAutoSavedAt(foundDraft.savedAt);
      setDraftRestoredMessage(`Draf pemarkahan dipulihkan secara automatik dari sesi sebelum ini (disimpan jam ${foundDraft.savedAt}).`);
    } else if (sc) {
      setGatekeeperStatus(sc.gatekeeperStatus);
      setScores(sc.criteriaScores);
      setDurationMin(sc.actualDurationMin);
      setDurationSec(sc.actualDurationSec);
      setStrengths(sc.qualitativeFeedback.strengths || '');
      setImprovements(sc.qualitativeFeedback.improvements || '');
      setIsManuallyDisqualified(sc.isDisqualified);
      setManualDisqualifyReason(sc.disqualificationReason || 'Pelanggaran syarat pertandingan / isu 3R');
      setIsLocked(sc.isLocked);
      setLastAutoSavedAt(null);
      setDraftRestoredMessage(null);
    } else {
      const initialGK: Record<string, boolean> = {};
      rubric.gatekeepers.forEach((gk) => {
        initialGK[gk.id] = true;
      });
      setGatekeeperStatus(initialGK);

      setScores({});
      setDurationMin(currentEntry.actualDurationMin);
      setDurationSec(currentEntry.actualDurationSec);
      setStrengths('');
      setImprovements('');
      setIsManuallyDisqualified(false);
      setManualDisqualifyReason('Pelanggaran syarat pertandingan / isu 3R');
      setIsLocked(false);
      setLastAutoSavedAt(null);
      setDraftRestoredMessage(null);
    }
  }, [currentEntry.id, currentJudge.id, scorecards, rubric, draftKey]);

  // Calculations
  const durationPenalty = calculateDurationPenalty(durationMin, durationSec);
  const grossScore = calculateGrossScore(scores, rubric.criteria);

  // Check if any mandatory disqualify gatekeeper is failed OR manually disqualified
  const hasFailedGatekeeper = rubric.gatekeepers.some(
    (gk) => gk.autoDisqualifyOnFail && gatekeeperStatus[gk.id] === false
  );
  const isDisqualified = isManuallyDisqualified || hasFailedGatekeeper;

  const activeDisqualificationReason = isManuallyDisqualified
    ? (manualDisqualifyReason || 'Batal Kelayakan (Disqualified)')
    : hasFailedGatekeeper
    ? 'Melanggar syarat wajib asas / Garis Panduan 3R'
    : undefined;

  const finalScore = isDisqualified ? 0 : Math.max(0, grossScore - durationPenalty);

  // 30-Second Automatic Draft Save Interval Timer
  useEffect(() => {
    if (isLocked) return;

    const autoSaveInterval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const draft: ScorecardDraft = {
        entryId: currentEntry.id,
        judgeId: currentJudge.id,
        gatekeeperStatus,
        criteriaScores: scores,
        durationMin,
        durationSec,
        strengths,
        improvements,
        isDisqualified,
        disqualificationReason: activeDisqualificationReason,
        savedAt: timeStr
      };

      try {
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setLastAutoSavedAt(timeStr);
      } catch (err) {
        console.warn('Failed to auto-save scorecard draft to localStorage:', err);
      }
    }, 30000); // 30,000ms = exactly every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [
    draftKey,
    isLocked,
    currentEntry.id,
    currentJudge.id,
    gatekeeperStatus,
    scores,
    durationMin,
    durationSec,
    strengths,
    improvements,
    isDisqualified,
    activeDisqualificationReason
  ]);

  // Fast-Track Auto-advance Mode
  const [isFastTrack, setIsFastTrack] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lp_fast_track') === 'true';
    } catch {
      return false;
    }
  });
  const [activeFocusedCritId, setActiveFocusedCritId] = useState<string | null>(null);

  const toggleFastTrack = () => {
    setIsFastTrack((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lp_fast_track', String(next));
      } catch (e) {
        console.warn(e);
      }
      setSaveToast(
        next
          ? '⚡ Mod Pantas diaktifkan: Skrin & fokus akan automatik bergerak ke kriteria seterusnya.'
          : 'Mod Pantas dinyahaktifkan.'
      );
      setTimeout(() => setSaveToast(null), 2800);
      return next;
    });
  };

  // Handle Score selection with Fast-Track Auto-Advance
  const handleScoreChange = (criterionId: string, value: number, index?: number) => {
    if (isLocked) return;
    setScores((prev) => ({
      ...prev,
      [criterionId]: value
    }));

    // Auto-advance if Fast-Track is active
    if (isFastTrack && typeof index === 'number') {
      if (index < rubric.criteria.length - 1) {
        const nextCrit = rubric.criteria[index + 1];
        setActiveFocusedCritId(nextCrit.id);

        setTimeout(() => {
          const nextElement = document.getElementById(`criterion-card-${nextCrit.id}`);
          if (nextElement) {
            nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Focus the first button on the next criterion card
            const firstButton = nextElement.querySelector<HTMLButtonElement>('button[data-likert="1"]') || nextElement.querySelector<HTMLButtonElement>('button');
            firstButton?.focus({ preventScroll: true });
          }
        }, 180);
      } else {
        // Last criterion reached: guide to qualitative comments
        setActiveFocusedCritId(null);
        setTimeout(() => {
          const feedbackSec = document.getElementById('qualitative-feedback-section');
          if (feedbackSec) {
            feedbackSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const textarea = feedbackSec.querySelector('textarea');
            textarea?.focus({ preventScroll: true });
          }
        }, 220);
      }
    }
  };

  // Handle Gatekeeper Toggle
  const handleToggleGatekeeper = (gkId: string) => {
    if (isLocked) return;
    setGatekeeperStatus((prev) => ({
      ...prev,
      [gkId]: !prev[gkId]
    }));
  };

  // Build current scorecard object
  const getCurrentScorecard = (): Scorecard => ({
    id: existingScorecard?.id || `sc-${currentEntry.id}-${currentJudge.id}`,
    entryId: currentEntry.id,
    judgeId: currentJudge.id,
    gatekeeperStatus,
    criteriaScores: scores,
    actualDurationMin: durationMin,
    actualDurationSec: durationSec,
    durationPenalty,
    grossScore,
    finalScore,
    isDisqualified,
    disqualificationReason: activeDisqualificationReason,
    qualitativeFeedback: {
      strengths,
      improvements
    },
    isLocked,
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  });

  const executeSave = (lock = false) => {
    const sc = getCurrentScorecard();
    sc.isLocked = lock;
    setIsLocked(lock);
    onSaveScorecard(sc);

    if (lock) {
      try {
        localStorage.removeItem(draftKey);
        setDraftRestoredMessage(null);
      } catch (e) {
        console.warn(e);
      }
    } else {
      const nowStr = new Date().toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const draft: ScorecardDraft = {
        entryId: currentEntry.id,
        judgeId: currentJudge.id,
        gatekeeperStatus,
        criteriaScores: scores,
        durationMin,
        durationSec,
        strengths,
        improvements,
        isDisqualified,
        disqualificationReason: activeDisqualificationReason,
        savedAt: nowStr
      };
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setLastAutoSavedAt(nowStr);
      } catch (e) {
        console.warn(e);
      }
    }

    setSaveToast(lock ? 'Markah telah dikunci dan disahkan secara rasmi!' : 'Markah draf berjaya disimpan!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch (e) {
      console.warn(e);
    }
    const sc = scorecards.find(
      (s) => s.entryId === currentEntry.id && s.judgeId === currentJudge.id
    );
    if (sc) {
      setGatekeeperStatus(sc.gatekeeperStatus);
      setScores(sc.criteriaScores);
      setDurationMin(sc.actualDurationMin);
      setDurationSec(sc.actualDurationSec);
      setStrengths(sc.qualitativeFeedback.strengths || '');
      setImprovements(sc.qualitativeFeedback.improvements || '');
      setIsManuallyDisqualified(sc.isDisqualified);
      setManualDisqualifyReason(sc.disqualificationReason || 'Pelanggaran syarat pertandingan / isu 3R');
    } else {
      const initialGK: Record<string, boolean> = {};
      rubric.gatekeepers.forEach((gk) => (initialGK[gk.id] = true));
      setGatekeeperStatus(initialGK);
      setScores({});
      setDurationMin(currentEntry.actualDurationMin);
      setDurationSec(currentEntry.actualDurationSec);
      setStrengths('');
      setImprovements('');
      setIsManuallyDisqualified(false);
      setManualDisqualifyReason('Pelanggaran syarat pertandingan / isu 3R');
    }
    setLastAutoSavedAt(null);
    setDraftRestoredMessage(null);
    setSaveToast('Draf pemarkahan dibuang.');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleSave = (lock = false) => {
    if (!isCurrentJudgeVerified) {
      setPendingSaveMode(lock ? 'lock' : 'save');
      setIsPinModalOpen(true);
      return;
    }
    executeSave(lock);
  };

  const handlePinSuccess = () => {
    onVerifyJudge(currentJudge.id);
    setIsPinModalOpen(false);
    if (pendingSaveMode) {
      const lock = pendingSaveMode === 'lock';
      executeSave(lock);
      setPendingSaveMode(null);
    } else {
      setSaveToast(`Identiti ${currentJudge.name} telah disahkan!`);
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleExportPDF = () => {
    const sc = getCurrentScorecard();
    exportScorecardPDF(currentEntry, sc, currentJudge, rubric);
  };

  const handleResetToDefault = () => {
    if (isLocked) return;
    const initialScores: Record<string, number> = {};
    rubric.criteria.forEach((crit) => {
      initialScores[crit.id] = 3;
    });
    setScores(initialScores);
    setDurationMin(currentEntry.actualDurationMin);
    setDurationSec(currentEntry.actualDurationSec);
    setStrengths('');
    setImprovements('');
    setSaveToast('Borang telah disetkan semula ke nilai lalai.');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const goToNextEntry = () => {
    if (currentEntryIndex < entries.length - 1) {
      setActiveEntryId(entries[currentEntryIndex + 1].id);
    }
  };

  const goToPrevEntry = () => {
    if (currentEntryIndex > 0) {
      setActiveEntryId(entries[currentEntryIndex - 1].id);
    }
  };

  const likertLabels: Record<number, string> = {
    1: '1 - Sangat Lemah',
    2: '2 - Kurang Memuaskan',
    3: '3 - Memuaskan',
    4: '4 - Baik',
    5: '5 - Cemerlang'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-amber-500/50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{saveToast}</span>
        </div>
      )}

      {/* Entry Selector & Navigation Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Entry Switcher Dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pilih Entri Video:
            </label>
            <div className="relative">
              <select
                value={currentEntry.id}
                onChange={(e) => setActiveEntryId(e.target.value)}
                className="bg-slate-50 border border-slate-300 font-semibold text-slate-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer pr-8"
              >
                {entries.map((entry) => {
                  const entrySc = scorecards.find(
                    (s) => s.entryId === entry.id && s.judgeId === currentJudge.id
                  );
                  const isDone = !!entrySc;
                  return (
                    <option key={entry.id} value={entry.id}>
                      {entry.code} — {entry.title} ({entry.category}) {isDone ? '✓ [Dinilai]' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevEntry}
                disabled={currentEntryIndex === 0}
                className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700"
                title="Entri Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono tabular-nums text-slate-500 px-1">
                {currentEntryIndex + 1} / {entries.length}
              </span>
              <button
                onClick={goToNextEntry}
                disabled={currentEntryIndex === entries.length - 1}
                className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700"
                title="Entri Seterusnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Entry Metadata Summary */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <span>
              <strong className="text-slate-900">Kategori:</strong> {currentEntry.category}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              <strong className="text-slate-900">Ketua:</strong> {currentEntry.leaderName}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              <strong className="text-slate-900">Ahli Kumpulan:</strong> {currentEntry.teamMembers.join(', ')}
            </span>
            {currentEntry.videoUrl && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <a
                  href={currentEntry.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-700 font-semibold inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Pautan Video
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Draft Restored Banner */}
      {draftRestoredMessage && !isLocked && (
        <div className="mb-6 bg-amber-50 border border-amber-300 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>{draftRestoredMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 underline self-start sm:self-auto cursor-pointer"
          >
            Padam Draf & Muat Semula Nilai Asal
          </button>
        </div>
      )}

      {/* Official Disqualification Penalty Checkbox Panel */}
      <div className={`mb-6 rounded-xl p-4 sm:p-5 border-2 transition-all ${
        isDisqualified
          ? 'bg-red-50/95 border-red-500 shadow-md ring-2 ring-red-400/30'
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isManuallyDisqualified}
              onChange={(e) => {
                if (isLocked) return;
                setIsManuallyDisqualified(e.target.checked);
                if (e.target.checked) {
                  setSaveToast('⚠️ Status Dibatalkan Kelayakan (Disqualified) dikenakan. Markah kriteria disembunyikan.');
                } else {
                  setSaveToast('Bendera penalti ditarik balik. Markah kriteria dipaparkan semula.');
                }
                setTimeout(() => setSaveToast(null), 3000);
              }}
              disabled={isLocked}
              className="w-5 h-5 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer mt-0.5"
            />
            <div>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Batal Kelayakan Penyertaan (Disqualify Entry)
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                Tandakan kotak ini untuk mengenakan bendera penalti batal kelayakan. Semua markah kriteria rubrik akan disembunyikan dan markah akhir dimuktamadkan kepada <strong>0 markah</strong> di Papan Keputusan.
              </p>
            </div>
          </label>

          {isDisqualified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-extrabold bg-red-600 text-white shadow-xs shrink-0 self-start sm:self-auto">
              <AlertTriangle className="w-3.5 h-3.5" />
              PENALTI FLAG: DISQUALIFIED
            </span>
          )}
        </div>

        {/* Reason Input if Disqualified */}
        {isDisqualified && (
          <div className="mt-4 pt-3 border-t border-red-200/80">
            <label className="block text-xs font-bold text-red-900 mb-1.5">
              Sebab Pembatalan Kelayakan (Akan dipaparkan pada Papan Keputusan & Laporan PDF):
            </label>
            <input
              type="text"
              value={manualDisqualifyReason}
              onChange={(e) => setManualDisqualifyReason(e.target.value)}
              disabled={isLocked}
              placeholder="Contoh: Mengandungi isu sensitiviti 3R / Pelanggaran hak cipta audio muzik / Arahan juri..."
              className="w-full bg-white border border-red-300 rounded-lg px-3 py-2 text-xs text-red-950 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {hasFailedGatekeeper && !isManuallyDisqualified && (
              <p className="text-[11px] text-red-700 mt-1">
                * Entri ini terbatal automatik kerana salah satu syarat wajib Gatekeeper gagal.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main 2-Zone Sandbox: Left Scoring Stage, Right Real-Time Tally & Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Zone 1): Rubric Criteria & Gatekeepers (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* SECTION 1: Gatekeeper Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  1. Senarai Semak Kelayakan Asas (Syarat Wajib / Gatekeeper)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Semua syarat di bawah adalah wajib disemak sebelum markah teknikal dinilai.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenRules}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5" />
                Lihat Syarat Lengkap
              </button>
            </div>

            <div className="space-y-3">
              {rubric.gatekeepers.map((gk, index) => {
                const isPassed = gatekeeperStatus[gk.id] !== false;
                return (
                  <div
                    key={gk.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${
                      isPassed
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-red-50/80 border-red-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          0{index + 1}.
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {gk.criterionText}
                        </span>
                        {gk.autoDisqualifyOnFail && (
                          <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100/80 px-1.5 py-0.5 rounded">
                            Syarat Terbatal (3R/Hak Cipta)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 pl-6">
                        {gk.ruleNote}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pl-6 sm:pl-0">
                      <button
                        type="button"
                        onClick={() => handleToggleGatekeeper(gk.id)}
                        disabled={isLocked}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                          isPassed
                            ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        [Ya] Lulus
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleGatekeeper(gk.id)}
                        disabled={isLocked}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                          !isPassed
                            ? 'bg-red-600 text-white shadow-sm hover:bg-red-700'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        [Tidak] Gagal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Duration & Time Penalty Calculator */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Durasi Sebenar Video & Kalkulator Penalti Masa
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sasaran: 2:00 hingga 3:00 minit. Penalti markah automatik jika melepasi toleransi masa poster.
                </p>
              </div>

              {durationPenalty > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Tolak {durationPenalty} Markah Penalti
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Dalam Had Masa (Penalti 0)
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minit:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={durationMin}
                    onChange={(e) => setDurationMin(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={isLocked}
                    className="w-24 bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 text-lg rounded-lg px-3 py-1.5 text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <span className="text-slate-400 font-bold text-xl mt-5">:</span>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Saat:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={durationSec}
                    onChange={(e) => setDurationSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    disabled={isLocked}
                    className="w-24 bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 text-lg rounded-lg px-3 py-1.5 text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div className="text-xs text-slate-500 mt-5 pl-2 font-mono">
                  = {durationMin * 60 + durationSec} saat
                </div>
              </div>

              {/* Penalty rules table hint */}
              <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-800">Syarat Penalti Poster:</div>
                <div className="text-slate-600 flex justify-between">
                  <span>Kurang 1:45 atau lebih 3:15:</span>
                  <strong className="text-amber-700 font-mono">-5 markah</strong>
                </div>
                <div className="text-slate-600 flex justify-between">
                  <span>Kurang 1:30 atau lebih 3:30:</span>
                  <strong className="text-red-700 font-mono">-10 markah</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Detailed Criteria Scoring Matrix */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2. Rubrik Pemarkahan Skala Likert (1–5)
                </h2>
                <span className="text-xs text-slate-500">
                  Jumlah Wajaran: 100% (Pengganda automatik dijana)
                </span>
              </div>

              {/* Fast-Track Mode Toggle Button */}
              <button
                type="button"
                onClick={toggleFastTrack}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isFastTrack
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm ring-2 ring-amber-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Apabila aktif, memilih skor Likert akan menggerakkan skrin & fokus ke kriteria seterusnya secara automatik"
              >
                <Zap className={`w-3.5 h-3.5 ${isFastTrack ? 'fill-slate-950 text-slate-950' : 'text-slate-400'}`} />
                <span>Mod Pantas (Fast-Track):</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isFastTrack ? 'bg-slate-950 text-amber-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isFastTrack ? 'HIDUP' : 'MATI'}
                </span>
              </button>
            </div>

            {/* Visual Criteria Rating Progress Bar Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isAllCriteriaRated
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isAllCriteriaRated ? '✓' : `${ratedCriteriaCount}/${totalCriteria}`}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Kemajuan Penilaian Kriteria
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isAllCriteriaRated
                        ? 'Semua kriteria telah selesai dinilai.'
                        : `${ratedCriteriaCount} daripada ${totalCriteria} kriteria dinilai (${totalCriteria - ratedCriteriaCount} lagi diperlukan).`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                    isAllCriteriaRated
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {progressPercent}% Dinilai ({ratedCriteriaCount}/{totalCriteria})
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/80">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isAllCriteriaRated
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Individual Criterion Checklist Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                {rubric.criteria.map((crit, idx) => {
                  const isRated = typeof scores[crit.id] === 'number' && scores[crit.id] > 0;
                  return (
                    <div
                      key={crit.id}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                        isRated
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isRated
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isRated ? '✓' : idx + 1}
                      </span>
                      <span className="truncate font-medium">{crit.name}</span>
                      {isRated ? (
                        <span className="ml-auto font-mono font-bold text-[11px] text-emerald-700">
                          Skor {scores[crit.id]}
                        </span>
                      ) : (
                        <span className="ml-auto text-[10px] text-slate-400 italic">
                          Menunggu
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {isDisqualified ? (
              <div className="bg-red-50 border-2 border-dashed border-red-300 rounded-xl p-8 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-red-100 border border-red-300 text-red-600 flex items-center justify-center mx-auto shadow-xs">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-red-700 bg-red-100 border border-red-300 px-3 py-1 rounded-full">
                    Penalti Batal Kelayakan Aktif
                  </span>
                  <h3 className="text-lg font-bold text-red-950 mt-2">
                    Markah Kriteria Individu Disembunyikan
                  </h3>
                  <p className="text-xs text-red-700 max-w-lg mx-auto mt-1 leading-relaxed">
                    Penyertaan video ini telah dibatalkan kelayakannya (Disqualified). Berdasarkan peraturan rasmi pertandingan SMK St. Thomas, markah kriteria rubrik (Likert) disembunyikan dan markah bersih dimuktamadkan kepada <strong>0.0 markah</strong> di Papan Keputusan.
                  </p>
                </div>
                <div className="inline-block bg-white border border-red-200 rounded-lg px-4 py-2 text-xs text-red-900 font-mono">
                  <strong>Catatan Juri:</strong> {activeDisqualificationReason || 'Pelanggaran syarat pertandingan'}
                </div>
                {!isLocked && isManuallyDisqualified && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsManuallyDisqualified(false);
                        setSaveToast('Bendera penalti dibatalkan. Markah kriteria dipaparkan semula.');
                        setTimeout(() => setSaveToast(null), 2500);
                      }}
                      className="text-xs text-red-800 hover:text-red-950 underline font-semibold cursor-pointer"
                    >
                      Tarik Balik Pembatalan Kelayakan untuk menilai semula kriteria
                    </button>
                  </div>
                )}
              </div>
            ) : (
              rubric.criteria.map((crit, index) => {
                const currentScore = scores[crit.id] || 0;
                const pointsObtained = currentScore * crit.multiplier;
                const maxPoints = 5 * crit.multiplier;
                const currentDescriptor = currentScore > 0 ? crit.descriptors[currentScore] : null;

                const isCardFocused = activeFocusedCritId === crit.id;

                return (
                  <div
                    key={crit.id}
                    id={`criterion-card-${crit.id}`}
                    tabIndex={-1}
                    className={`bg-white border rounded-xl p-5 sm:p-6 shadow-sm transition-all duration-300 ${
                      isCardFocused
                        ? 'border-amber-500 ring-4 ring-amber-300/60 shadow-lg scale-[1.008]'
                        : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    {/* Criterion Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded transition-colors ${
                            isCardFocused
                              ? 'bg-amber-400 text-slate-950 font-extrabold'
                              : 'text-amber-600 bg-amber-50'
                          }`}>
                            Kriteria 0{index + 1}
                          </span>
                          <h3 className="text-base font-bold text-slate-900">
                            {crit.name}
                          </h3>
                          {isCardFocused && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded animate-pulse">
                              Fokus Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 max-w-xl">
                          {crit.focus}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                        <div className="text-right">
                          <div className="text-[11px] text-slate-500">
                            Wajaran {crit.weight}% (×{crit.multiplier})
                          </div>
                          <div className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                            {currentScore > 0 ? (
                              <>
                                <span className="text-amber-600 text-base">{pointsObtained}</span> / {maxPoints} m
                              </>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Belum Dinilai</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Likert Buttons 1 to 5 */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Pilih Skor Likert (1 hingga 5):
                      </label>
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {[1, 2, 3, 4, 5].map((lvl) => {
                          const isSelected = currentScore === lvl;
                          return (
                            <button
                              key={lvl}
                              type="button"
                              data-likert={lvl}
                              onClick={() => handleScoreChange(crit.id, lvl, index)}
                              disabled={isLocked}
                              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg border text-center transition-all ${
                                isSelected
                                  ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-md ring-2 ring-amber-300'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 font-medium'
                              }`}
                            >
                              <span className="text-base sm:text-lg font-mono font-bold leading-none mb-1">
                                {lvl}
                              </span>
                              <span className="text-[10px] sm:text-[11px] leading-tight line-clamp-1">
                                {crit.descriptors[lvl]?.levelName || `Skor ${lvl}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live Descriptor Detail Box */}
                    {currentDescriptor ? (
                      <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                          <span>Tahap {currentScore}: {currentDescriptor.levelName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{currentScore} × {crit.multiplier} = {pointsObtained} Markah</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {currentDescriptor.text}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2.5 text-xs text-slate-500 text-center">
                        Sila klik salah satu skor Likert di atas (1 hingga 5) untuk melengkapkan penilaian kriteria ini.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* SECTION 4: Qualitative Feedback */}
          <div id="qualitative-feedback-section" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              3. Ulasan & Maklum Balas Kualitatif Hakim
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kekuatan Utama Karya:
              </label>
              <textarea
                rows={2}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                disabled={isLocked}
                placeholder="Contoh: Penggunaan muzik latar sape asli sangat berkesan, penghayatan tema perpaduan mendalam..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Aspek Penambahbaikan:
              </label>
              <textarea
                rows={2}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                disabled={isLocked}
                placeholder="Contoh: Kestabilan kamera semasa babak temu bual boleh diperkemas, imbangan audio vokal..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column (Zone 2): Real-Time Scorecard Summary & Actions Deck (4 cols) */}
        <div className="lg:col-span-4 sticky top-20 space-y-6">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Keputusan Semasa
                </span>
                <h3 className="text-sm font-bold text-white">
                  Ringkasan Skor Video
                </h3>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[11px] text-slate-400">Hakim:</span>
                <div className="text-xs font-bold text-white mb-1">{currentJudge.name}</div>
                {isCurrentJudgeVerified ? (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>PIN Disahkan</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingSaveMode(null);
                      setIsPinModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-[10px] text-amber-300 hover:text-white font-semibold bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded transition-colors"
                    title="Sahkan PIN Hakim ini"
                  >
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Sahkan PIN</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Auto-save 30s Status indicator */}
            {!isLocked && (
              <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-medium text-slate-200">Auto-simpan (30s):</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                  {lastAutoSavedAt ? `Jam ${lastAutoSavedAt}` : 'Aktif'}
                </span>
              </div>
            )}

            {/* Criteria Rating Progress Bar in Summary Card */}
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Kemajuan Kriteria:</span>
                <span className="font-mono font-bold text-amber-400 tabular-nums">
                  {ratedCriteriaCount} / {totalCriteria} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isAllCriteriaRated ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] mt-1.5 flex items-center justify-between">
                <span className={isAllCriteriaRated ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {isAllCriteriaRated ? '✓ Selesai dinilai' : `Baki ${totalCriteria - ratedCriteriaCount} belum dinilai`}
                </span>
                <span className="text-slate-500 font-mono">{progressPercent}%</span>
              </div>

              {/* Quick Fast-Track Toggle */}
              <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className={`w-3 h-3 ${isFastTrack ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                  <span>Auto-gerak (Fast-Track):</span>
                </span>
                <button
                  type="button"
                  onClick={toggleFastTrack}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    isFastTrack
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Tukar Mod Pantas"
                >
                  {isFastTrack ? 'HIDUP' : 'MATI'}
                </button>
              </div>
            </div>

            {/* Score Breakdown Bars or Disqualification Penalty Flag */}
            {isDisqualified ? (
              <div className="bg-red-950/70 border border-red-500/60 rounded-xl p-4 text-center space-y-2 mb-6 shadow-inner">
                <ShieldAlert className="w-6 h-6 text-red-400 mx-auto" />
                <div className="text-xs font-extrabold text-red-200 uppercase tracking-wide">
                  Markah Kriteria Disembunyikan
                </div>
                <p className="text-[11px] text-red-300/80 leading-tight">
                  Status entri telah ditandakan sebagai <strong>DISQUALIFIED</strong>. Markah kriteria individu disembunyikan.
                </p>
                <div className="text-[10px] text-red-400 font-mono pt-1 break-words">
                  {activeDisqualificationReason}
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {rubric.criteria.map((crit) => {
                  const s = scores[crit.id] || 0;
                  const mark = s * crit.multiplier;
                  const max = 5 * crit.multiplier;
                  return (
                    <div key={crit.id} className="text-xs">
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="truncate pr-2">{crit.name}</span>
                        <span className="font-mono font-semibold tabular-nums text-white">
                          {mark} / {max}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(mark / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Final Calculation Box */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Jumlah Markah Kasar:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {grossScore} / 100
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Tolak Penalti Durasi:</span>
                <span className={`font-mono font-bold tabular-nums ${durationPenalty > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  -{durationPenalty} markah
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <div>
                  <div className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Markah Akhir Bersih
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isDisqualified ? 'Status: Terbatal' : 'Skor Rasmi'}
                  </div>
                </div>
                <div className="text-3xl font-mono font-extrabold text-white tabular-nums">
                  {isDisqualified ? (
                    <span className="text-red-500 text-xl font-sans">TERBATAL</span>
                  ) : (
                    <>
                      {finalScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Markah Draf</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(!isLocked)}
                className={`w-full py-2.5 px-4 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors ${
                  isLocked
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{isLocked ? 'Buka Kunci Markah' : 'Kunci & Sahkan Pemarkahan'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Eksport PDF Scorecard</span>
              </button>

              {!isLocked && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="w-full py-2 px-3 text-slate-400 hover:text-slate-200 text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Set Semula Markah Lalai</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-500" />
              Formula Pengiraan Rasmi:
            </h4>
            <p className="leading-relaxed">
              Markah Kriteria = (Skor Likert / 5) × Wajaran.
            </p>
            <div className="bg-slate-50 p-2.5 rounded font-mono text-[11px] text-slate-800 border border-slate-200">
              Markah Bersih = Markah Kasar - Penalti Masa
            </div>
            <p className="text-[11px] text-slate-500">
              Hakim boleh mengeksport PDF Borang Penilaian rasmi bila-bila masa untuk semakan dan simpanan fizikal fail pertandingan.
            </p>
          </div>
        </div>
      </div>

      {/* Judge Security PIN Modal */}
      <JudgePinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingSaveMode(null);
        }}
        judge={currentJudge}
        allJudges={judges}
        onSelectDifferentJudge={setActiveJudgeId}
        onSuccess={handlePinSuccess}
        actionDescription={
          pendingSaveMode === 'lock'
            ? 'mengunci dan mengesahkan markah rasmi'
            : 'menyimpan markah penilaian'
        }
      />
    </div>
  );
};
