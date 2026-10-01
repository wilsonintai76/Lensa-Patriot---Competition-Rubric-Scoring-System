import React, { useState } from 'react';
import {
  Trophy,
  Activity,
  Video,
  Settings,
  Users,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { Entry, Judge, RubricConfig, Scorecard } from '../../types/rubric';
import { Leaderboard } from '../Leaderboard';
import { EntryManager } from '../EntryManager';
import { RubricCustomizer } from '../RubricCustomizer';

interface PenganjurPortalProps {
  entries: Entry[];
  judges: Judge[];
  rubric: RubricConfig;
  scorecards: Scorecard[];
  onAddEntry: (entry: Entry) => void;
  onUpdateEntry: (entry: Entry) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateRubric: (rubric: RubricConfig) => void;
  onScoreEntry: (entryId: string) => void;
  onExportMasterPDF: () => void;
  verifiedJudgeIds: string[];
}

export const PenganjurPortal: React.FC<PenganjurPortalProps> = ({
  entries,
  judges,
  rubric,
  scorecards,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onUpdateRubric,
  onScoreEntry,
  onExportMasterPDF,
  verifiedJudgeIds
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'leaderboard' | 'monitor' | 'entries' | 'rubric' | 'judges'>('leaderboard');

  // Overall metrics
  const totalEntries = entries.length;
  const fullyEvaluatedEntries = entries.filter((e) => {
    const sc = scorecards.filter((s) => s.entryId === e.id);
    return sc.length >= judges.length;
  }).length;
  const disqualifiedEntries = entries.filter((e) => {
    return scorecards.some((s) => s.entryId === e.id && s.isDisqualified);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Admin Portal Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Portal Penganjur & Urusetia Pertandingan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Papan Kawalan Urusetia: {rubric.schoolName}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Urus penarafan rasmi, pantau kemajuan penjurian panel secara langsung, kelola senarai karya video, dan konfigurasi wajaran rubrik pertandingan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={onExportMasterPDF}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Muat Turun Laporan PDF</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveAdminTab('leaderboard')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'leaderboard'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Papan Pendahulu Rasmi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('monitor')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'monitor'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Pemantau Penjurian & Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('entries')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'entries'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Pengurusan Video ({entries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('rubric')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'rubric'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Konfigurasi Rubrik</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('judges')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeAdminTab === 'judges'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Panel Hakim & PIN ({judges.length})</span>
        </button>
      </div>

      {/* VIEW 1: Leaderboard */}
      {activeAdminTab === 'leaderboard' && (
        <Leaderboard
          entries={entries}
          scorecards={scorecards}
          judges={judges}
          rubric={rubric}
          onSelectEntryToScore={onScoreEntry}
        />
      )}

      {/* VIEW 2: Pemantau Penjurian & Audit Matrix */}
      {activeAdminTab === 'monitor' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Jumlah Entri Video</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1">
                {totalEntries}
              </div>
              <span className="text-[11px] text-slate-400">Merentasi semua kategori</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Lengkap Dinilai (3/3)</span>
              <div className="text-2xl font-mono font-bold text-emerald-600 mt-1">
                {fullyEvaluatedEntries} / {totalEntries}
              </div>
              <span className="text-[11px] text-emerald-700">
                {Math.round((fullyEvaluatedEntries / totalEntries) * 100)}% selesai sepenuhnya
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Hakim Bertugas</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1">
                {judges.length} Panel
              </div>
              <span className="text-[11px] text-slate-400">
                {verifiedJudgeIds.length} daripada {judges.length} telah sahkan PIN
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Entri Batal Kelayakan</span>
              <div className="text-2xl font-mono font-bold text-red-600 mt-1">
                {disqualifiedEntries.length}
              </div>
              <span className="text-[11px] text-red-700">
                Dikenakan bendera penalti
              </span>
            </div>
          </div>

          {/* Live Matrix: Entries vs Judges */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Matriks Kemajuan Penjurian Secara Langsung
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pantau status penilaian setiap karya video oleh setiap panel hakim secara masa nyata.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {scorecards.length} rekod kad skor tersimpan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-semibold">Kod Entri</th>
                    <th className="py-2.5 px-3 font-semibold">Tajuk Video & Ketua</th>
                    <th className="py-2.5 px-3 font-semibold">Kategori</th>
                    {judges.map((j) => (
                      <th key={j.id} className="py-2.5 px-3 font-semibold text-center">
                        {j.name.split(' ')[0]} ({j.role.split(' ')[0]})
                      </th>
                    ))}
                    <th className="py-2.5 px-3 font-semibold text-center">Status Keseluruhan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map((entry) => {
                    const entryScs = scorecards.filter((s) => s.entryId === entry.id);
                    const isEntryDq = entryScs.some((s) => s.isDisqualified);
                    const dqReason = entryScs.find((s) => s.isDisqualified)?.disqualificationReason;

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {entry.code}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{entry.title}</div>
                          <div className="text-[11px] text-slate-500">{entry.leaderName}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {entry.category}
                        </td>

                        {judges.map((j) => {
                          const sc = entryScs.find((s) => s.judgeId === j.id);

                          if (!sc) {
                            return (
                              <td key={j.id} className="py-3 px-3 text-center">
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                                  Belum
                                </span>
                              </td>
                            );
                          }

                          if (sc.isDisqualified) {
                            return (
                              <td key={j.id} className="py-3 px-3 text-center">
                                <span className="text-[10px] font-mono font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded">
                                  DQ (0m)
                                </span>
                              </td>
                            );
                          }

                          if (sc.isLocked) {
                            return (
                              <td key={j.id} className="py-3 px-3 text-center">
                                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  {sc.finalScore.toFixed(1)}m
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td key={j.id} className="py-3 px-3 text-center">
                              <span className="text-[10px] font-mono font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 text-amber-600" />
                                Draf ({sc.finalScore.toFixed(1)}m)
                              </span>
                            </td>
                          );
                        })}

                        <td className="py-3 px-3 text-center">
                          {isEntryDq ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full" title={dqReason}>
                              <AlertTriangle className="w-3 h-3" /> Terbatal
                            </span>
                          ) : entryScs.length >= judges.length ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Lengkap ({entryScs.length}/{judges.length})
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-medium">
                              {entryScs.length}/{judges.length} Selesai
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disqualification Audit Log */}
          {disqualifiedEntries.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Audit Log: Entri Dibatalkan Kelayakan ({disqualifiedEntries.length})
              </h4>
              <div className="divide-y divide-red-200 text-xs">
                {disqualifiedEntries.map((e) => {
                  const dqSc = scorecards.find((s) => s.entryId === e.id && s.isDisqualified);
                  const judge = judges.find((j) => j.id === dqSc?.judgeId);

                  return (
                    <div key={e.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-red-800">{e.code}</span> — <strong className="text-slate-900">{e.title}</strong>
                        <div className="text-[11px] text-red-700 mt-0.5">
                          Sebab: {dqSc?.disqualificationReason || 'Pelanggaran syarat pertandingan / isu 3R'}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-600 font-mono">
                        Dikenakan oleh: {judge?.name || 'Hakim'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Entry Manager */}
      {activeAdminTab === 'entries' && (
        <EntryManager
          entries={entries}
          rubric={rubric}
          onAddEntry={onAddEntry}
          onUpdateEntry={onUpdateEntry}
          onDeleteEntry={onDeleteEntry}
          onScoreEntry={onScoreEntry}
        />
      )}

      {/* VIEW 4: Rubric Customizer */}
      {activeAdminTab === 'rubric' && (
        <RubricCustomizer
          rubric={rubric}
          onUpdateRubric={onUpdateRubric}
        />
      )}

      {/* VIEW 5: Judges Administration */}
      {activeAdminTab === 'judges' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pengurusan Panel Hakim & Kod Keselamatan PIN
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Senarai rasmi hakim pertandingan, status pengesahan identiti dan kod PIN untuk kunci markah.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600">
              {judges.length} Hakim Berdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {judges.map((j) => {
              const isVerified = verifiedJudgeIds.includes(j.id);
              const scoredCount = scorecards.filter((s) => s.judgeId === j.id).length;

              return (
                <div key={j.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{j.name}</h4>
                      <p className="text-xs text-slate-500">{j.role}</p>
                      {j.organization && (
                        <p className="text-[11px] text-slate-400">{j.organization}</p>
                      )}
                    </div>
                    {isVerified ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Disahkan
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        Belum Sahkan
                      </span>
                    )}
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Kod Keselamatan PIN:</span>
                      <strong className="font-mono text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded text-xs tracking-widest">
                        {j.pin || '1234'}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Kemajuan Penilaian:</span>
                      <strong className="font-mono text-amber-700">
                        {scoredCount} / {entries.length} video
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-slate-700 space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-700" />
              Protokol Keselamatan PIN Juri:
            </div>
            <p className="text-[11px] leading-relaxed">
              Kod PIN 4-digit digunakan oleh panel hakim untuk mengesahkan identiti dan mengunci borang pemarkahan secara rasmi bagi mengelakkan perubahan tidak disengajakan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
