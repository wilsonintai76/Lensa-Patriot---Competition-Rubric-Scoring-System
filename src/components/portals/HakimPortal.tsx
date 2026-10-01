import React, { useState } from 'react';
import {
  FileText,
  ListOrdered,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ShieldCheck,
  Video,
  ChevronRight,
  ExternalLink,
  Table,
  Zap,
  RotateCcw,
  QrCode
} from 'lucide-react';
import { Entry, Judge, RubricConfig, Scorecard } from '../../types/rubric';
import { ScoringCard } from '../ScoringCard';
import { JudgeQRScannerModal } from '../JudgeQRScannerModal';

interface HakimPortalProps {
  entries: Entry[];
  activeEntryId: string;
  setActiveEntryId: (id: string) => void;
  judges: Judge[];
  activeJudgeId: string;
  setActiveJudgeId: (id: string) => void;
  rubric: RubricConfig;
  scorecards: Scorecard[];
  onSaveScorecard: (scorecard: Scorecard) => void;
  onOpenRules: () => void;
  verifiedJudgeIds: string[];
  onVerifyJudge: (judgeId: string) => void;
  onOpenJudgePinModal: () => void;
}

export const HakimPortal: React.FC<HakimPortalProps> = ({
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
  onVerifyJudge,
  onOpenJudgePinModal
}) => {
  const [activeHakimSubTab, setActiveHakimSubTab] = useState<'scoring' | 'queue' | 'my-scores'>('scoring');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'draft' | 'locked'>('all');

  const currentJudge = judges.find((j) => j.id === activeJudgeId) || judges[0];
  const isJudgeVerified = verifiedJudgeIds.includes(currentJudge.id);

  // Statistics for this judge
  const judgeScorecards = scorecards.filter((sc) => sc.judgeId === currentJudge.id);
  const completedCount = judgeScorecards.filter((sc) => sc.isLocked).length;
  const draftCount = judgeScorecards.filter((sc) => !sc.isLocked).length;
  const pendingCount = entries.length - judgeScorecards.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Judge Profile & Credential Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-base shrink-0">
            ⚖️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                {currentJudge.name}
              </h2>
              {isJudgeVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> PIN Disahkan
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenJudgePinModal}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-amber-400" /> Sahkan PIN Hakim
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentJudge.role} {currentJudge.organization ? `· ${currentJudge.organization}` : ''}
            </p>
          </div>
        </div>

        {/* Quick Judging Progress Stats for Active Judge */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-center">
            <div className="text-[10px] text-slate-400 font-medium">Selesai Dikunci</div>
            <div className="font-mono font-bold text-emerald-400 text-sm">
              {completedCount} / {entries.length}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-center">
            <div className="text-[10px] text-slate-400 font-medium">Draf / Menunggu</div>
            <div className="font-mono font-bold text-amber-400 text-sm">
              {draftCount} draf · {pendingCount} baru
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation for Judge Portal */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveHakimSubTab('scoring')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeHakimSubTab === 'scoring'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Borang Penilaian Terperinci</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHakimSubTab('queue')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeHakimSubTab === 'queue'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Antrean Pemarkahan ({entries.length} Entri)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHakimSubTab('my-scores')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeHakimSubTab === 'my-scores'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Rekod Skor Saya ({judgeScorecards.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Imbas Kod QR</span>
          </button>

          <button
            type="button"
            onClick={onOpenRules}
            className="text-xs text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-1 underline cursor-pointer"
          >
            Lihat Syarat & Rubrik
          </button>
        </div>
      </div>

      {/* VIEW 1: Scoring Card */}
      {activeHakimSubTab === 'scoring' && (
        <ScoringCard
          entries={entries}
          activeEntryId={activeEntryId}
          setActiveEntryId={setActiveEntryId}
          judges={judges}
          activeJudgeId={activeJudgeId}
          setActiveJudgeId={setActiveJudgeId}
          rubric={rubric}
          scorecards={scorecards}
          onSaveScorecard={onSaveScorecard}
          onOpenRules={onOpenRules}
          verifiedJudgeIds={verifiedJudgeIds}
          onVerifyJudge={onVerifyJudge}
        />
      )}

      {/* VIEW 2: Antrean Pemarkahan (Judging Queue) */}
      {activeHakimSubTab === 'queue' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Antrean & Status Penjurian Entri
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih mana-mana karya video untuk dinilai atau disemak semula.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="Semua">Semua Kategori</option>
                {rubric.categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Belum Dinilai</option>
                <option value="draft">Draf Tersimpan</option>
                <option value="locked">Selesai & Dikunci</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries
              .filter((e) => categoryFilter === 'Semua' || e.category === categoryFilter)
              .filter((e) => {
                const sc = scorecards.find((s) => s.entryId === e.id && s.judgeId === currentJudge.id);
                if (statusFilter === 'locked') return sc?.isLocked;
                if (statusFilter === 'draft') return sc && !sc.isLocked;
                if (statusFilter === 'pending') return !sc;
                return true;
              })
              .map((entry) => {
                const sc = scorecards.find((s) => s.entryId === entry.id && s.judgeId === currentJudge.id);
                const isSelected = entry.id === activeEntryId;

                return (
                  <div
                    key={entry.id}
                    className={`bg-white border rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-300 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {entry.code}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {entry.category}
                          </span>
                        </div>

                        {sc?.isDisqualified ? (
                          <span className="text-[10px] font-mono font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded">
                            DISQUALIFIED
                          </span>
                        ) : sc?.isLocked ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Dikunci ({sc.finalScore.toFixed(1)}m)
                          </span>
                        ) : sc ? (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" /> Draf ({sc.finalScore.toFixed(1)}m)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Belum Dinilai
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                          {entry.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Ketua: <strong className="text-slate-700">{entry.leaderName}</strong> ({entry.teamMembers.length} ahli)
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span className="font-mono">
                          Durasi: {entry.actualDurationMin}m {entry.actualDurationSec}s
                        </span>
                        {entry.videoUrl && (
                          <a
                            href={entry.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-700 hover:text-amber-900 inline-flex items-center gap-0.5 font-medium"
                          >
                            <span>Video</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveEntryId(entry.id);
                          setActiveHakimSubTab('scoring');
                        }}
                        className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                            : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
                        }`}
                      >
                        <span>{sc ? 'Semak / Kemaskini Markah' : 'Buka Borang Pemarkahan'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* VIEW 3: My Scorecards Table */}
      {activeHakimSubTab === 'my-scores' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Rekod Skor Penjurian: {currentJudge.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Senarai keseluruhan markah yang telah anda berikan untuk setiap karya video.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-slate-700">
              Jumlah: {judgeScorecards.length} / {entries.length} video
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">Kod</th>
                  <th className="py-2.5 px-3 font-semibold">Tajuk Karya & Ketua</th>
                  <th className="py-2.5 px-3 font-semibold">Kategori</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Markah Kasar</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Penalti</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Markah Bersih</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {judgeScorecards.map((sc) => {
                  const entry = entries.find((e) => e.id === sc.entryId);
                  if (!entry) return null;

                  return (
                    <tr key={sc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {entry.code}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{entry.title}</div>
                        <div className="text-[11px] text-slate-500">{entry.leaderName}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {entry.category}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">
                        {sc.grossScore} m
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">
                        {sc.durationPenalty > 0 ? (
                          <span className="text-red-600 font-bold">-{sc.durationPenalty}m</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-slate-900 tabular-nums text-sm">
                        {sc.isDisqualified ? (
                          <span className="text-red-600 font-sans text-xs">0 (Batal)</span>
                        ) : (
                          <span className="text-amber-700">{sc.finalScore.toFixed(1)}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {sc.isDisqualified ? (
                          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                            Disqualified
                          </span>
                        ) : sc.isLocked ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            ✓ Dikunci
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                            Draf
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEntryId(entry.id);
                            setActiveHakimSubTab('scoring');
                          }}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-xs transition-colors cursor-pointer"
                        >
                          Semak
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Scanner & Lookup Modal */}
      <JudgeQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        entries={entries}
        onSelectEntry={(scannedId) => {
          setActiveEntryId(scannedId);
          setActiveHakimSubTab('scoring');
        }}
      />
    </div>
  );
};
