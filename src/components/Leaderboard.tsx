import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Download,
  Filter,
  Search,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { Entry, Judge, RubricConfig, Scorecard, ConsolidatedLeaderboardRow } from '../types/rubric';
import { exportLeaderboardPDF, exportScorecardPDF } from '../utils/pdfExport';

interface LeaderboardProps {
  entries: Entry[];
  scorecards: Scorecard[];
  judges: Judge[];
  rubric: RubricConfig;
  onSelectEntryToScore: (entryId: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  scorecards,
  judges,
  rubric,
  onSelectEntryToScore
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedJudgeFilter, setSelectedJudgeFilter] = useState<string>('all'); // 'all' or judgeId
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'rank' | 'score' | 'duration'>('rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Compute consolidated rows
  const leaderboardData: ConsolidatedLeaderboardRow[] = useMemo(() => {
    return entries.map((entry) => {
      // Find matching scorecards
      let matchingScorecards = scorecards.filter((sc) => sc.entryId === entry.id);
      if (selectedJudgeFilter !== 'all') {
        matchingScorecards = matchingScorecards.filter((sc) => sc.judgeId === selectedJudgeFilter);
      }

      const judgeCount = matchingScorecards.length;

      if (judgeCount === 0) {
        // Unscored entry
        return {
          entry,
          category: entry.category,
          judgeCount: 0,
          avgGrossScore: 0,
          avgPenalty: 0,
          avgFinalScore: 0,
          criteriaAverages: {},
          isDisqualified: false,
          rank: 999,
          scorecards: []
        };
      }

      // Check if disqualified by any judge and extract reason
      const dqScorecard = matchingScorecards.find((sc) => sc.isDisqualified);
      const isDisqualified = !!dqScorecard;
      const disqualificationReason = dqScorecard?.disqualificationReason || (isDisqualified ? 'Batal Kelayakan (Disqualified)' : undefined);

      const totalGross = matchingScorecards.reduce((sum, sc) => sum + sc.grossScore, 0);
      const totalPenalty = matchingScorecards.reduce((sum, sc) => sum + sc.durationPenalty, 0);
      const totalFinal = matchingScorecards.reduce((sum, sc) => sum + sc.finalScore, 0);

      // Average criteria scores
      const criteriaAverages: Record<string, number> = {};
      rubric.criteria.forEach((crit) => {
        const critTotal = matchingScorecards.reduce(
          (sum, sc) => sum + (sc.criteriaScores[crit.id] || 0) * crit.multiplier,
          0
        );
        criteriaAverages[crit.id] = Math.round((critTotal / judgeCount) * 10) / 10;
      });

      return {
        entry,
        category: entry.category,
        judgeCount,
        avgGrossScore: Math.round((totalGross / judgeCount) * 10) / 10,
        avgPenalty: Math.round((totalPenalty / judgeCount) * 10) / 10,
        avgFinalScore: isDisqualified ? 0 : Math.round((totalFinal / judgeCount) * 10) / 10,
        criteriaAverages,
        isDisqualified,
        disqualificationReason,
        rank: 0,
        scorecards: matchingScorecards
      };
    });
  }, [entries, scorecards, selectedJudgeFilter, rubric]);

  // Filter by category and search
  const filteredRows = useMemo(() => {
    let result = leaderboardData.filter((row) => {
      const matchCat =
        selectedCategory === 'Semua' || row.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        row.entry.title.toLowerCase().includes(q) ||
        row.entry.code.toLowerCase().includes(q) ||
        row.entry.leaderName.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    // Sort: qualified entries with higher final score first, then disqualified
    result.sort((a, b) => {
      if (a.isDisqualified && !b.isDisqualified) return 1;
      if (!a.isDisqualified && b.isDisqualified) return -1;
      if (b.avgFinalScore !== a.avgFinalScore) {
        return b.avgFinalScore - a.avgFinalScore;
      }
      return a.entry.code.localeCompare(b.entry.code);
    });

    // Assign rank
    result = result.map((row, idx) => ({
      ...row,
      rank: row.isDisqualified || row.judgeCount === 0 ? 0 : idx + 1,
      prize:
        idx === 0 && !row.isDisqualified && row.judgeCount > 0
          ? 'Tempat Pertama (RM200 Baucar)'
          : idx === 1 && !row.isDisqualified && row.judgeCount > 0
          ? 'Tempat Kedua (RM150 Baucar)'
          : idx === 2 && !row.isDisqualified && row.judgeCount > 0
          ? 'Tempat Ketiga (RM100 Baucar)'
          : undefined
    }));

    return result;
  }, [leaderboardData, selectedCategory, searchQuery]);

  // Podium Top 3 (only from currently filtered category)
  const podiumWinners = useMemo(() => {
    return filteredRows.filter((r) => r.rank > 0 && r.rank <= 3);
  }, [filteredRows]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleExportMasterPDF = () => {
    exportLeaderboardPDF(filteredRows, selectedCategory, rubric, judges);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Papan Pendahulu Rasmi Pertandingan
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Kedudukan masa-nyata dikira berasaskan markah Likert wajaran tolak penalti masa.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {podiumWinners.length > 0 && (
              <button
                type="button"
                onClick={triggerConfetti}
                className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-900" />
                <span>Raikan Pemenang!</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportMasterPDF}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-sm transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Eksport Jadual PDF</span>
            </button>
          </div>
        </div>

        {/* Category & Judge Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 mr-1 uppercase">Kategori:</span>
            {['Semua', 'Kategori A', 'Kategori B', 'Kategori C'].map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'Semua' ? 'Semua Kategori' : cat}
                </button>
              );
            })}
          </div>

          {/* Search & Judge Aggregation Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kod atau tajuk..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 w-44 sm:w-52"
              />
            </div>

            {/* Judge Mode Switcher */}
            <select
              value={selectedJudgeFilter}
              onChange={(e) => setSelectedJudgeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">Purata Semua Hakim</option>
              {judges.map((j) => (
                <option key={j.id} value={j.id}>
                  Skor: {j.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Podium Showcase (Top 3 in selected view) */}
      {podiumWinners.length >= 3 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
            {/* 2nd Place (Silver) */}
            {podiumWinners[1] && (
              <div className="bg-slate-100/90 border border-slate-300 rounded-xl p-5 text-center flex flex-col items-center order-2 md:order-1 h-64 justify-between shadow-sm">
                <div>
                  <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-400 text-slate-700 font-extrabold text-sm flex items-center justify-center mx-auto mb-2">
                    2
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase">Naib Juara</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">
                    {podiumWinners[1].entry.title}
                  </h4>
                  <div className="text-xs text-slate-500">{podiumWinners[1].entry.code} · {podiumWinners[1].entry.category}</div>
                </div>

                <div className="w-full pt-3 border-t border-slate-200">
                  <div className="text-2xl font-mono font-extrabold text-slate-900">
                    {podiumWinners[1].avgFinalScore.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-700 mt-1">
                    RM150 Baucar Koperasi
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place (Gold / Juara) */}
            {podiumWinners[0] && (
              <div className="bg-gradient-to-b from-amber-50 to-amber-100/70 border-2 border-amber-400 rounded-xl p-6 text-center flex flex-col items-center order-1 md:order-2 h-72 justify-between shadow-md">
                <div>
                  <div className="w-12 h-12 rounded-full bg-amber-400 border-2 border-amber-500 text-slate-950 font-extrabold text-base flex items-center justify-center mx-auto mb-2 shadow">
                    <Trophy className="w-6 h-6 text-slate-950" />
                  </div>
                  <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">JUARA KESELURUHAN</span>
                  <h4 className="font-extrabold text-slate-950 text-base mt-1 line-clamp-2">
                    {podiumWinners[0].entry.title}
                  </h4>
                  <div className="text-xs text-slate-700 font-medium">{podiumWinners[0].entry.code} · {podiumWinners[0].entry.category}</div>
                </div>

                <div className="w-full pt-3 border-t border-amber-300">
                  <div className="text-3xl font-mono font-extrabold text-slate-950">
                    {podiumWinners[0].avgFinalScore.toFixed(1)} <span className="text-xs font-normal text-slate-600">/ 100</span>
                  </div>
                  <div className="text-xs font-extrabold text-amber-900 mt-1">
                    🏆 RM200 Baucar Koperasi
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {podiumWinners[2] && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 text-center flex flex-col items-center order-3 md:order-3 h-60 justify-between shadow-sm">
                <div>
                  <div className="w-9 h-9 rounded-full bg-amber-200 border-2 border-amber-400 text-amber-900 font-extrabold text-sm flex items-center justify-center mx-auto mb-2">
                    3
                  </div>
                  <span className="text-xs font-bold text-amber-800 uppercase">Tempat Ketiga</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">
                    {podiumWinners[2].entry.title}
                  </h4>
                  <div className="text-xs text-slate-500">{podiumWinners[2].entry.code} · {podiumWinners[2].entry.category}</div>
                </div>

                <div className="w-full pt-3 border-t border-amber-200">
                  <div className="text-2xl font-mono font-extrabold text-slate-900">
                    {podiumWinners[2].avgFinalScore.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-700 mt-1">
                    RM100 Baucar Koperasi
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Standings Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 text-center w-14">Ked.</th>
                <th className="py-3.5 px-3 w-20">Kod</th>
                <th className="py-3.5 px-4 min-w-[200px]">Tajuk Video & Peserta</th>
                <th className="py-3.5 px-3">Kategori</th>
                <th className="py-3.5 px-3 text-center">Durasi</th>
                <th className="py-3.5 px-3 text-center">Markah Kasar</th>
                <th className="py-3.5 px-3 text-center">Penalti</th>
                <th className="py-3.5 px-4 text-center">Markah Akhir</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tiada entri dijumpai untuk carian atau penapis ini.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isTop3 = row.rank > 0 && row.rank <= 3;
                  const rowBg =
                    row.rank === 1
                      ? 'bg-amber-50/40 hover:bg-amber-50/70'
                      : row.isDisqualified
                      ? 'bg-red-50/30 hover:bg-red-50/60'
                      : 'hover:bg-slate-50/80';

                  return (
                    <tr key={row.entry.id} className={`${rowBg} transition-colors`}>
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {row.isDisqualified ? (
                          <span className="text-red-500 font-sans text-[11px]">-</span>
                        ) : row.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs">
                            1
                          </span>
                        ) : row.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-bold text-xs">
                            2
                          </span>
                        ) : row.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
                            3
                          </span>
                        ) : row.judgeCount === 0 ? (
                          <span className="text-slate-400">-</span>
                        ) : (
                          <span className="text-slate-700">{row.rank}</span>
                        )}
                      </td>

                      {/* Code */}
                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-800">
                        {row.entry.code}
                      </td>

                      {/* Title & Leader */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {row.entry.title}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Ketua: {row.entry.leaderName} ({row.entry.teamMembers.length} ahli)
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {row.entry.category}
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                        {row.entry.actualDurationMin}m {row.entry.actualDurationSec}s
                      </td>

                      {/* Gross Score */}
                      <td className="py-3.5 px-3 text-center font-mono text-slate-700 tabular-nums">
                        {row.judgeCount > 0 ? `${row.avgGrossScore.toFixed(1)} m` : '-'}
                      </td>

                      {/* Penalty */}
                      <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                        {row.avgPenalty > 0 ? (
                          <span className="text-red-600 font-bold">-{row.avgPenalty}m</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>

                      {/* Final Net Score */}
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                        {row.isDisqualified ? (
                          <span className="text-red-600 font-bold font-sans">0 (Batal)</span>
                        ) : row.judgeCount > 0 ? (
                          <span className={`text-base font-extrabold ${isTop3 ? 'text-amber-600' : 'text-slate-900'}`}>
                            {row.avgFinalScore.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum dinilai</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        {row.isDisqualified ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                              <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                              DISQUALIFIED
                            </span>
                            {row.disqualificationReason && (
                              <span className="text-[10px] text-red-600 font-medium max-w-[130px] truncate" title={row.disqualificationReason}>
                                {row.disqualificationReason}
                              </span>
                            )}
                          </div>
                        ) : row.judgeCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Layak ({row.judgeCount} Hakim)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Menunggu</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectEntryToScore(row.entry.id)}
                            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-xs transition-colors"
                            title="Buka Borang Pemarkahan"
                          >
                            Nilai
                          </button>

                          {row.scorecards.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const sc = row.scorecards[0];
                                const j = judges.find((item) => item.id === sc.judgeId) || judges[0];
                                exportScorecardPDF(row.entry, sc, j, rubric);
                              }}
                              className="p-1 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded transition-colors"
                              title="Muat Turun PDF Scorecard"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
