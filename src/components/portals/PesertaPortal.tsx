import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Video,
  Info,
  ExternalLink,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Flame,
  MessageSquare,
  FileCheck2
} from 'lucide-react';
import { Entry, RubricConfig, Scorecard } from '../../types/rubric';
import { calculateDurationPenalty } from '../../data/defaultData';
import { RegistrationModal } from '../RegistrationModal';
import { ParticipantQRCodeModal } from '../ParticipantQRCodeModal';
import { QrCode } from 'lucide-react';

interface PesertaPortalProps {
  entries: Entry[];
  rubric: RubricConfig;
  scorecards: Scorecard[];
  onOpenRules: () => void;
  onAddEntry: (newEntry: Entry) => void;
  onOpenInJudgeView?: (entryId: string) => void;
}

export const PesertaPortal: React.FC<PesertaPortalProps> = ({
  entries,
  rubric,
  scorecards,
  onOpenRules,
  onAddEntry,
  onOpenInJudgeView
}) => {
  const [activePesertaTab, setActivePesertaTab] = useState<'status' | 'rubric' | 'guidelines' | 'faq'>('status');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryCode, setSelectedEntryCode] = useState<string>(entries[0]?.code || '');
  const [selectedCriterionLevel, setSelectedCriterionLevel] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    rubric.criteria.forEach((c) => {
      initial[c.id] = 5; // Default show excellent descriptor
    });
    return initial;
  });

  // Find selected entry
  const activeEntry = entries.find((e) => e.code === selectedEntryCode) || entries[0];
  const matchingScorecards = activeEntry
    ? scorecards.filter((sc) => sc.entryId === activeEntry.id)
    : [];
  const isFullyEvaluated = matchingScorecards.length >= 3;
  const isDisqualified = matchingScorecards.some((sc) => sc.isDisqualified);
  const disqualificationReason = matchingScorecards.find((sc) => sc.isDisqualified)?.disqualificationReason;

  const durationPenalty = activeEntry
    ? calculateDurationPenalty(activeEntry.actualDurationMin, activeEntry.actualDurationSec)
    : 0;

  // Filtered entries for search dropdown
  const filteredEntries = entries.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      e.code.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.leaderName.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Participant Portal Hero Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-2xl p-6 sm:p-8 text-slate-950 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-slate-950/15 border border-slate-950/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Rasmi Peserta & Pelajar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Lensa Patriot: Pertandingan Video Pendek
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-900/90 mt-2 leading-relaxed">
            Selamat datang, peserta {rubric.schoolName}! Semak syarat rasmi, eksplorasi kriteria rubrik pemarkahan secara telus, dan pantau status serta ulasan karya video pasukan anda di sini.
          </p>

          <div className="flex flex-wrap gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsRegistrationOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-extrabold bg-slate-950 text-amber-300 hover:bg-slate-900 shadow-md flex items-center gap-1.5 transition-all cursor-pointer ring-2 ring-amber-300/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Daftar Pertandingan (Google Sign-In)</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePesertaTab('status')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePesertaTab === 'status'
                  ? 'bg-slate-950 text-amber-300 shadow'
                  : 'bg-slate-950/10 hover:bg-slate-950/20 text-slate-950'
              }`}
            >
              Semak Status Video Pasukan
            </button>
            <button
              type="button"
              onClick={() => setActivePesertaTab('rubric')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePesertaTab === 'rubric'
                  ? 'bg-slate-950 text-amber-300 shadow'
                  : 'bg-slate-950/10 hover:bg-slate-950/20 text-slate-950'
              }`}
            >
              Eksplorasi Rubrik Telus (Skala 1-5)
            </button>
            <button
              type="button"
              onClick={() => setActivePesertaTab('guidelines')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePesertaTab === 'guidelines'
                  ? 'bg-slate-950 text-amber-300 shadow'
                  : 'bg-slate-950/10 hover:bg-slate-950/20 text-slate-950'
              }`}
            >
              Garis Panduan & Syarat Durasi
            </button>
            <button
              type="button"
              onClick={() => setActivePesertaTab('faq')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePesertaTab === 'faq'
                  ? 'bg-slate-950 text-amber-300 shadow'
                  : 'bg-slate-950/10 hover:bg-slate-950/20 text-slate-950'
              }`}
            >
              Soalan Lazim (FAQ)
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Semakan Status & Maklum Balas Video */}
      {activePesertaTab === 'status' && (
        <div className="space-y-6">
          {/* Self-Registration Banner Card */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                🎬
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Belum Mendaftar Karya Video Pasukan Anda?
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Daftar penyertaan video secara terus dalam talian. Gunakan akaun Google / DELIMa MOE untuk pengesahan identiti dan perakuan syarat.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRegistrationOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-lg shadow flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Daftar Video Sekarang</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-600" />
                Semak Status Video Pasukan Anda
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pilih atau cari Kod Entri pasukan anda (contoh: <code>VID-A01</code>, <code>VID-B02</code>) untuk menyemak kepatuhan durasi, status penilaian juri, dan ulasan membina.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tajuk, kod entri atau ketua pasukan..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <select
                  value={activeEntry?.code || ''}
                  onChange={(e) => setSelectedEntryCode(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  {filteredEntries.map((e) => (
                    <option key={e.id} value={e.code}>
                      {e.code} — {e.title} ({e.leaderName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {activeEntry ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Details Card (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {activeEntry.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {activeEntry.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-2">
                        {activeEntry.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ketua Pasukan: <strong className="text-slate-800">{activeEntry.leaderName}</strong> · Tarikh Hantar: {activeEntry.submissionDate}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsQrModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Papar Kod QR Peserta</span>
                      </button>

                      {activeEntry.videoUrl && (
                        <a
                          href={activeEntry.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-amber-400 hover:bg-slate-800 text-xs font-bold rounded-lg transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Tonton Video</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Team Members List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Senarai Ahli Pasukan ({activeEntry.teamMembers.length} Pelajar):
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeEntry.teamMembers.map((member, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-md font-medium"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Video Notes / Synopsis */}
                  {activeEntry.notes && (
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700">
                      <div className="font-bold text-slate-900 mb-0.5">Sinopsis / Nota Karya:</div>
                      <p className="italic text-slate-600 leading-relaxed">{activeEntry.notes}</p>
                    </div>
                  )}

                  {/* Duration Compliance & Penalty Status */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Kepatuhan Durasi Video Rasmi
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {activeEntry.actualDurationMin}m {activeEntry.actualDurationSec}s ({activeEntry.actualDurationMin * 60 + activeEntry.actualDurationSec}s)
                      </span>
                    </div>

                    {durationPenalty === 0 ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Cemerlang!</strong> Durasi video mematuhi julat rasmi 2:00 – 3:00 minit (tiada penalti ditolak).</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-red-800 bg-red-50 border border-red-200 px-3 py-2 rounded-lg font-medium">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span><strong>Perhatian:</strong> Video dikenakan penalti durasi <strong>-{durationPenalty} markah</strong> kerana berada di luar julat sasaran rasmi.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Qualitative Feedback from Judges */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    Ulasan & Maklum Balas Membina Panel Juri
                  </h3>

                  {matchingScorecards.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-6 text-center text-xs text-slate-500">
                      Video ini sedang menunggu giliran untuk dinilai oleh panel hakim rasmi. Ulasan membina akan dipaparkan di sini setelah dinilai.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {matchingScorecards.map((sc, idx) => (
                        <div key={sc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/80">
                            <span className="font-bold text-slate-800">Ulasan Hakim 0{idx + 1}</span>
                            <span className="text-[11px] font-mono text-slate-500">Dikemaskini: {sc.updatedAt}</span>
                          </div>

                          {sc.qualitativeFeedback.strengths && (
                            <div className="text-xs">
                              <span className="font-bold text-emerald-800">Kekuatan Karya: </span>
                              <span className="text-slate-700">{sc.qualitativeFeedback.strengths}</span>
                            </div>
                          )}

                          {sc.qualitativeFeedback.improvements && (
                            <div className="text-xs">
                              <span className="font-bold text-amber-800">Aspek Boleh Dipertingkat: </span>
                              <span className="text-slate-700">{sc.qualitativeFeedback.improvements}</span>
                            </div>
                          )}

                          {!sc.qualitativeFeedback.strengths && !sc.qualitativeFeedback.improvements && (
                            <div className="text-xs text-slate-400 italic">Tiada catatan teks khusus dari juri ini.</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Evaluation Status Summary (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status Penjurian Semasa
                  </h4>

                  {isDisqualified ? (
                    <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-center space-y-2">
                      <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                      <div className="text-xs font-mono font-extrabold text-red-700 uppercase">
                        PENALTI: DISQUALIFIED
                      </div>
                      <p className="text-xs text-red-800 leading-tight">
                        Penyertaan ini telah dikenakan pembatalan kelayakan. Sila hubungi urusetia jika memerlukan penjelasan lanjut.
                      </p>
                      {disqualificationReason && (
                        <div className="bg-white/80 p-2 rounded text-[11px] font-mono text-red-900 border border-red-200 mt-1">
                          Catatan: {disqualificationReason}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Hakim Menilai:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {matchingScorecards.length} / 3 Hakim
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(matchingScorecards.length / 3) * 100}%` }}
                        />
                      </div>

                      <div className="text-xs text-slate-500">
                        {isFullyEvaluated ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Lengkap dinilai oleh semua 3 hakim panel.
                          </span>
                        ) : (
                          <span>Penilaian sedang berlangsung oleh panel hakim.</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                    <div className="font-semibold text-slate-700">Nota Privasi Peserta:</div>
                    <p className="text-[11px] leading-relaxed">
                      Markah rasmi penuh akan diumumkan pada Majlis Penutupan Bulan Kebangsaan sekolah.
                    </p>
                  </div>
                </div>

                {/* Participant QR Access Card */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-center space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-950">
                    <QrCode className="w-4 h-4 text-amber-700" />
                    <span>Pas Kod QR Penjurian</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Kod QR unik untuk diimbas oleh panel hakim bagi menarik data video pasukan anda secara terus ke borang pemarkahan.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="w-full py-2 px-3 bg-white hover:bg-amber-100/70 border border-amber-300 rounded-lg text-xs font-extrabold text-amber-900 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-700" />
                    <span>Buka & Cetak Kod QR</span>
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-700" />
                    Hadiah Kategori {activeEntry.category}
                  </div>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li>🥇 <strong>Juara:</strong> RM200 Baucar Koperasi + Sijil</li>
                    <li>🥈 <strong>Naib Juara:</strong> RM150 Baucar Koperasi + Sijil</li>
                    <li>🥉 <strong>Ketiga:</strong> RM100 Baucar Koperasi + Sijil</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Tiada penyertaan dipilih.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Eksplorasi Rubrik Telus */}
      {activePesertaTab === 'rubric' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              Eksplorasi Rubrik Pemarkahan Skala Likert 1–5
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Ketahui dengan teliti bagaimana karya video anda dinilai oleh panel juri. Setiap kriteria mempunyai wajaran tertentu dan 5 tahap penilaian terperinci.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rubric.criteria.map((crit, index) => {
              const currentLvl = selectedCriterionLevel[crit.id] || 5;
              const currentDesc = crit.descriptors[currentLvl];

              return (
                <div
                  key={crit.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                          Kriteria 0{index + 1}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{crit.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{crit.focus}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                        Wajaran: {crit.weight}%
                      </span>
                    </div>
                  </div>

                  {/* Level Switcher */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                      Lihat Deskriptor Tahap (1 hingga 5):
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() =>
                            setSelectedCriterionLevel((prev) => ({
                              ...prev,
                              [crit.id]: lvl
                            }))
                          }
                          className={`py-1.5 text-xs font-mono font-bold rounded border transition-colors cursor-pointer ${
                            currentLvl === lvl
                              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          Tahap {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Descriptor Box */}
                  {currentDesc && (
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 text-xs space-y-1">
                      <div className="font-bold text-amber-950 flex items-center justify-between">
                        <span>Tahap {currentLvl}: {currentDesc.levelName}</span>
                        <span className="font-mono text-amber-700 font-extrabold">{currentLvl * crit.multiplier} markah</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px]">{currentDesc.text}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Garis Panduan & Format Video */}
      {activePesertaTab === 'guidelines' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-600" />
                Garis Panduan Rasmi Penyertaan Pertandingan
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sila pastikan video anda memenuhi kesemua syarat di bawah sebelum menghantar kepada pihak urusetia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  Tema Pertandingan
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>"{rubric.theme}"</strong>. Karya video mestilah menonjolkan nilai perpaduan, sejarah kemerdekaan, atau kemajuan anak bangsa di Sarawak.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Ketetapan Durasi
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sasaran: <strong>2:00 – 3:00 minit</strong>. Grace buffer dibenarkan ialah 1:45 hingga 3:15 minit. Video kurang 1:30 atau lebih 3:30 akan ditolak 10 markah.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  Sensitiviti 3R & Hak Cipta
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dilarang sama sekali menyentuh isu 3R (Agama, Bangsa, Institusi Diraja). Penggunaan muzik latar bebas royalti atau berlesen sahaja.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onOpenRules}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Info className="w-4 h-4" />
                <span>Buka Dokumen Syarat Lengkap PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Soalan Lazim (FAQ) */}
      {activePesertaTab === 'faq' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            Soalan Lazim Peserta (FAQ)
          </h2>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 text-xs">
                S1: Bolehkah kami menggunakan format video menegak (TikTok/Reels 9:16)?
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ya! Pertandingan menerima format menegak (9:16) dan mendatar (16:9). Resolusi minimum dicadangkan ialah Full HD (1080p).
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 text-xs">
                S2: Berapakah bilangan ahli dalam sesebuah pasukan?
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap pasukan boleh dianggotai antara 1 hingga 5 orang pelajar SMK St. Thomas dengan seorang ketua pasukan dilantik.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 text-xs">
                S3: Bagaimanakah markah akhir dikira jika terdapat 3 hakim?
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sistem Lensa Patriot secara automatik mengira purata markah bersih ketiga-tiga hakim selepas ditolak penalti durasi (jika ada).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal with Google Sign-in */}
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        rubric={rubric}
        entries={entries}
        onAddEntry={onAddEntry}
        onRegistrationSuccess={(newCode) => {
          setSelectedEntryCode(newCode);
          setActivePesertaTab('status');
        }}
      />

      {/* Participant QR Code Pass Modal */}
      <ParticipantQRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        entry={activeEntry}
        rubric={rubric}
        onOpenInJudgeView={onOpenInJudgeView}
      />
    </div>
  );
};
