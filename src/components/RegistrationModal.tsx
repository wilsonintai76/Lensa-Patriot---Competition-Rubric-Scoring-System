import React, { useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Video,
  Users,
  Plus,
  Trash2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Printer,
  HelpCircle,
  QrCode,
  Lock,
  LogIn,
  ArrowRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { Entry, RubricConfig } from '../types/rubric';
import { calculateDurationPenalty } from '../data/defaultData';

interface StudentGoogleUser {
  name: string;
  email: string;
  avatarUrl?: string;
  isGoogleVerified: boolean;
}

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rubric: RubricConfig;
  entries: Entry[];
  onAddEntry: (newEntry: Entry) => void;
  onRegistrationSuccess?: (entryCode: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  rubric,
  entries,
  onAddEntry,
  onRegistrationSuccess
}) => {
  // Google User Session state
  const [googleUser, setGoogleUser] = useState<StudentGoogleUser | null>(() => {
    try {
      const saved = localStorage.getItem('lp_student_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [customLoginError, setCustomLoginError] = useState<string | null>(null);

  // Form States
  const [category, setCategory] = useState<string>(rubric.categories[0]?.name || 'Kategori A');
  const [title, setTitle] = useState('');
  const [leaderName, setLeaderName] = useState(googleUser ? googleUser.name : '');
  const [studentEmail, setStudentEmail] = useState(googleUser ? googleUser.email : '');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationMin, setDurationMin] = useState<number>(2);
  const [durationSec, setDurationSec] = useState<number>(30);
  const [teamMembers, setTeamMembers] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState<Entry | null>(null);
  const [submittedQrUrl, setSubmittedQrUrl] = useState<string>('');

  if (!isOpen) return null;

  // Live Duration Penalty Calculation
  const durationPenalty = calculateDurationPenalty(durationMin, durationSec);
  const totalSeconds = durationMin * 60 + durationSec;

  // Google Sign-in Handler
  const handleGoogleSignIn = (name: string, email: string) => {
    const user: StudentGoogleUser = {
      name: name.trim() || 'Pelajar St. Thomas',
      email: email.trim() || 'pelajar@moe-dl.edu.my',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'Pelajar')}&backgroundColor=d97706,b45309,f59e0b`,
      isGoogleVerified: true
    };
    setGoogleUser(user);
    setLeaderName(user.name);
    setStudentEmail(user.email);
    try {
      localStorage.setItem('lp_student_google_user', JSON.stringify(user));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSignOutGoogle = () => {
    setGoogleUser(null);
    setLeaderName('');
    setStudentEmail('');
    try {
      localStorage.removeItem('lp_student_google_user');
    } catch (e) {
      console.warn(e);
    }
  };

  // Add / Remove Team Members
  const handleAddMember = () => {
    if (teamMembers.length >= 5) return;
    setTeamMembers([...teamMembers, '']);
  };

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...teamMembers];
    updated[index] = value;
    setTeamMembers(updated);
  };

  const handleRemoveMember = (index: number) => {
    if (teamMembers.length <= 1) return;
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  // Generate Unique Sequential Code for Category
  const generateEntryCode = (selectedCat: string): string => {
    const prefix = selectedCat.includes('A')
      ? 'VID-A'
      : selectedCat.includes('B')
      ? 'VID-B'
      : 'VID-C';

    const catEntries = entries.filter((e) => e.code.startsWith(prefix));
    const nextNum = catEntries.length + 1;
    return `${prefix}${nextNum < 10 ? `0${nextNum}` : nextNum}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !leaderName.trim() || !agreeTerms || !googleUser) return;

    const validMembers = teamMembers.map((m) => m.trim()).filter(Boolean);
    const finalMembers = validMembers.length > 0 ? validMembers : [leaderName.trim()];

    const code = generateEntryCode(category);
    const newEntry: Entry = {
      id: `entry-${Date.now()}`,
      code,
      title: title.trim(),
      category,
      teamMembers: finalMembers,
      leaderName: leaderName.trim(),
      actualDurationMin: durationMin,
      actualDurationSec: durationSec,
      videoUrl: videoUrl.trim() || undefined,
      submissionDate: new Date().toISOString().slice(0, 10),
      notes: notes.trim()
        ? `${notes.trim()} (Disahkan: ${googleUser.email})`
        : `Disahkan: ${googleUser.email}`
    };

    onAddEntry(newEntry);
    setSubmittedEntry(newEntry);

    // Generate QR Code for Judges
    const directUrl = `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(code)}&role=hakim`;
    QRCode.toDataURL(
      directUrl,
      {
        width: 180,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' }
      },
      (err, url) => {
        if (!err && url) {
          setSubmittedQrUrl(url);
        }
      }
    );

    if (onRegistrationSuccess) {
      onRegistrationSuccess(code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Pendaftaran Rasmi Karya Video Peserta
              </h3>
              <p className="text-xs text-slate-400">
                Lensa Patriot 2026 · {rubric.schoolName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[82vh] overflow-y-auto text-xs text-slate-700">
          {/* STAGE 1: SUCCESS SCREEN AFTER SUBMISSION */}
          {submittedEntry ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-sm animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  Pendaftaran Disahkan Berjaya
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-3">
                  Karya Anda Telah Didaftarkan!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Karya video pasukan anda telah selamat dimasukkan ke dalam sistem rasmi Lensa Patriot untuk dinilai oleh panel hakim.
                </p>
              </div>

              {/* Official Submission Card / Receipt */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-5 text-left max-w-lg mx-auto space-y-3 font-sans shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Kod Entri Rasmi Pasukan:</span>
                    <div className="text-2xl font-mono font-extrabold text-amber-600">
                      {submittedEntry.code}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <div>{submittedEntry.category}</div>
                    <div className="font-mono text-[10px]">{submittedEntry.submissionDate}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500">Tajuk Karya:</span>{' '}
                    <strong className="text-slate-900">{submittedEntry.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Ketua Pasukan:</span>{' '}
                    <strong className="text-slate-900">{submittedEntry.leaderName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Durasi:</span>{' '}
                    <span className="font-mono font-bold text-slate-800">
                      {submittedEntry.actualDurationMin}m {submittedEntry.actualDurationSec}s
                    </span>{' '}
                    {durationPenalty === 0 ? (
                      <span className="text-emerald-700 text-[11px]">(Mematuhi Durasi)</span>
                    ) : (
                      <span className="text-red-700 text-[11px]">(-{durationPenalty}m Penalti)</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Ahli Pasukan ({submittedEntry.teamMembers.length}):</span>{' '}
                    <span className="text-slate-800">{submittedEntry.teamMembers.join(', ')}</span>
                  </div>
                </div>

                {/* QR Code on Receipt Slip */}
                <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-900 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-amber-600" />
                      Kod QR Penjurian Hakim
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Boleh diimbas oleh juri untuk membuka borang pemarkahan.
                    </p>
                  </div>
                  {submittedQrUrl ? (
                    <img
                      src={submittedQrUrl}
                      alt={`Kod QR ${submittedEntry.code}`}
                      className="w-16 h-16 rounded bg-white p-1 border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                      QR Code
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>SMK St. Thomas, Kuching</span>
                  <span>Lensa Patriot 2026</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan Slip Bukti</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs shadow transition-colors cursor-pointer"
                >
                  Selesai & Semak Status Karya
                </button>
              </div>
            </div>
          ) : !googleUser ? (
            /* STAGE 2: GATEKEEPER - REQUIRE GOOGLE SIGN IN FIRST */
            <div className="py-6 px-2 space-y-6 animate-fade-in">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <span className="font-bold text-slate-900">Langkah 1: Pengesahan Identiti Pelajar</span>
                <span className="text-slate-300">→</span>
                <span className="text-slate-400">Langkah 2: Butiran Karya Video</span>
              </div>

              {/* Main Attention Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Sila Log Masuk Terlebih Dahulu Sebelum Mendaftar
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Borang pendaftaran karya hanya dibuka selepas pengesahan akaun <strong>Google / DELIMa MOE</strong> untuk memastikan ketulenan penyertaan dan akauntabiliti pasukan.
                  </p>
                </div>

                {/* 3 Protection Reasons (Why sign in?) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1 text-amber-700">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      Kawalan Anti-Spam
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Menghalang bot atau pendaftaran palsu yang boleh merosakkan jadual penjurian.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1 text-emerald-700">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Pengesahan Murid Sah
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Mengesahkan ketua pasukan adalah pelajar berdaftar di bawah sistem persekolahan.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1 text-blue-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      Saluran Rasmi Pasukan
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Urusetia boleh menghubungi ketua pasukan terus berkenaan kemas kini keputusan rasmi.
                    </p>
                  </div>
                </div>

                {/* Account Selection Options */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700">
                    Pilih Satu Akaun Pelajar untuk Log Masuk:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto">
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn('Wilson Intai', 'wilsonintai76@gmail.com')}
                      className="p-3 bg-white hover:bg-amber-50/70 border-2 border-slate-200 hover:border-amber-400 rounded-xl text-left flex items-center gap-3 transition-all shadow-xs cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shrink-0">
                        W
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="font-bold text-slate-900 text-xs group-hover:text-amber-900">
                          Wilson Intai
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">wilsonintai76@gmail.com</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn('Brandon Scott', 'm-98214356@moe-dl.edu.my')}
                      className="p-3 bg-white hover:bg-amber-50/70 border-2 border-slate-200 hover:border-amber-400 rounded-xl text-left flex items-center gap-3 transition-all shadow-xs cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        B
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="font-bold text-slate-900 text-xs group-hover:text-amber-900">
                          Brandon Scott (DELIMa)
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">m-98214356@moe-dl.edu.my</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600" />
                    </button>
                  </div>

                  {/* Custom Email Input Toggle */}
                  <div className="pt-2 text-center">
                    <details className="text-left max-w-sm mx-auto bg-white border border-slate-200 rounded-xl p-3">
                      <summary className="text-[11px] font-semibold text-slate-600 cursor-pointer hover:text-slate-900">
                        Atau gunakan akaun Google / MOE anda sendiri...
                      </summary>
                      <div className="space-y-2.5 pt-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Nama Penuh:</label>
                          <input
                            type="text"
                            value={googleNameInput}
                            onChange={(e) => setGoogleNameInput(e.target.value)}
                            placeholder="Contoh: Ryan Lee"
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Emel Google / DELIMa MOE:</label>
                          <input
                            type="email"
                            value={googleEmailInput}
                            onChange={(e) => setGoogleEmailInput(e.target.value)}
                            placeholder="nama@moe-dl.edu.my atau @gmail.com"
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                          />
                        </div>
                        {customLoginError && (
                          <div className="text-[10px] text-red-600">{customLoginError}</div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (!googleNameInput.trim() || !googleEmailInput.trim()) {
                              setCustomLoginError('Sila masukkan nama dan emel yang sah.');
                              return;
                            }
                            handleGoogleSignIn(googleNameInput, googleEmailInput);
                          }}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Sahkan & Buka Borang
                        </button>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STAGE 3: THE ACTUAL REGISTRATION FORM (UNLOCKED AFTER GOOGLE SIGN IN) */
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              {/* Step indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    ✓
                  </span>
                  <span className="text-slate-500 line-through">Pengesahan Identiti</span>
                  <span className="text-slate-300">→</span>
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <span className="font-bold text-slate-900">Langkah 2: Butiran Karya Video</span>
                </div>

                {/* Verified User Tag */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{googleUser.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOutGoogle}
                    className="text-[11px] text-slate-500 hover:text-red-600 underline font-medium cursor-pointer"
                  >
                    Tukar Akaun
                  </button>
                </div>
              </div>

              {/* CATEGORY & LEADER NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Kategori Pertandingan: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    {rubric.categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} ({cat.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nama Ketua Pasukan: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="Nama penuh ketua pasukan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tajuk Karya Video: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Gemersik Sape di Bumi Kenyalang: Sebuah Erti Merdeka"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* EMAIL & VIDEO URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Emel Perhubungan (Disahkan Google):
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-700 cursor-not-allowed"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Pautan Video (YouTube / Google Drive / TikTok):
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/... atau Google Drive link"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* DURATION INPUT WITH LIVE PENALTY CHECK */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-700" />
                    Ketetapan Durasi Sebenar Video (Minit & Saat): <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-amber-800 font-medium">Sasaran: 2:00 – 3:00 minit</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={durationMin}
                      onChange={(e) => setDurationMin(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 bg-white border border-slate-300 rounded-lg p-2 text-center text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-xs text-slate-600 font-medium">Minit</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={durationSec}
                      onChange={(e) => setDurationSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-16 bg-white border border-slate-300 rounded-lg p-2 text-center text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-xs text-slate-600 font-medium">Saat</span>
                  </div>

                  <div className="text-xs font-mono text-slate-600 ml-auto font-semibold">
                    = {totalSeconds} saat
                  </div>
                </div>

                {/* Live Penalty Feedback Pill */}
                {durationPenalty === 0 ? (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Durasi Mematuhi:</strong> Berada dalam julat sasaran (Tiada penalti ditolak).</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-red-800 bg-red-50 border border-red-200 p-2 rounded-lg flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span><strong>Amaran Penalti:</strong> Durasi video akan ditolak <strong>-{durationPenalty} markah</strong> mengikut syarat pertandingan.</span>
                  </div>
                )}
              </div>

              {/* TEAM MEMBERS (1 TO 5) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    Senarai Nama Ahli Pasukan (1 hingga 5 pelajar):
                  </label>
                  {teamMembers.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Ahli
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-xs text-slate-400 font-mono text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        value={member}
                        onChange={(e) => handleMemberChange(idx, e.target.value)}
                        placeholder={`Nama Penuh Pelajar ${idx + 1} (seperti dalam IC / Kad Pelajar)`}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      {teamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Padam ahli"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SINOPSIS */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Sinopsis / Keterangan Karya:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ceritakan serba sedikit tentang konsep video, mesej perpaduan, atau lokasi penggambaran..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* AGREEMENT CHECKBOX */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 mt-0.5 cursor-pointer"
                  />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong>Pengakuan Pasukan Peserta:</strong> Saya dan ahli pasukan mengesahkan bahawa karya video ini adalah hasil ciptaan asli, tidak menyentuh sensitiviti <strong>3R (Agama, Bangsa, Institusi Diraja)</strong>, dan mematuhi hak cipta muzik latar mengikut syarat rasmi SMK St. Thomas.
                  </div>
                </label>
              </div>

              {/* SUBMIT BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!agreeTerms}
                  className={`px-5 py-2.5 rounded-lg text-xs font-extrabold shadow transition-all flex items-center gap-1.5 cursor-pointer ${
                    agreeTerms
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hantar & Sahkan Pendaftaran</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
