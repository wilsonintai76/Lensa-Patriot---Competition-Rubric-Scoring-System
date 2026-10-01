import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Video, CheckCircle2, User, Clock, FilePlus, ExternalLink } from 'lucide-react';
import { Entry, RubricConfig } from '../types/rubric';

interface EntryManagerProps {
  entries: Entry[];
  rubric: RubricConfig;
  onAddEntry: (entry: Entry) => void;
  onUpdateEntry: (entry: Entry) => void;
  onDeleteEntry: (id: string) => void;
  onScoreEntry: (id: string) => void;
}

export const EntryManager: React.FC<EntryManagerProps> = ({
  entries,
  rubric,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onScoreEntry
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(rubric.categories[0]?.id || 'Kategori A');
  const [leaderName, setLeaderName] = useState('');
  const [teamMembersText, setTeamMembersText] = useState('');
  const [durationMin, setDurationMin] = useState(2);
  const [durationSec, setDurationSec] = useState(30);
  const [videoUrl, setVideoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setCode('');
    setTitle('');
    setCategory(rubric.categories[0]?.id || 'Kategori A');
    setLeaderName('');
    setTeamMembersText('');
    setDurationMin(2);
    setDurationSec(30);
    setVideoUrl('');
    setNotes('');
    setIsAdding(false);
    setEditingEntryId(null);
  };

  const startEdit = (entry: Entry) => {
    setEditingEntryId(entry.id);
    setCode(entry.code);
    setTitle(entry.title);
    setCategory(entry.category);
    setLeaderName(entry.leaderName);
    setTeamMembersText(entry.teamMembers.join(', '));
    setDurationMin(entry.actualDurationMin);
    setDurationSec(entry.actualDurationSec);
    setVideoUrl(entry.videoUrl || '');
    setNotes(entry.notes || '');
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      alert('Sila masukkan Kod dan Tajuk Video.');
      return;
    }

    const members = teamMembersText
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    if (editingEntryId) {
      const updated: Entry = {
        id: editingEntryId,
        code: code.trim().toUpperCase(),
        title: title.trim(),
        category,
        leaderName: leaderName.trim() || members[0] || 'Peserta',
        teamMembers: members.length > 0 ? members : [leaderName || 'Peserta'],
        actualDurationMin: durationMin,
        actualDurationSec: durationSec,
        videoUrl: videoUrl.trim() || undefined,
        submissionDate: new Date().toISOString().slice(0, 10),
        notes: notes.trim() || undefined
      };
      onUpdateEntry(updated);
    } else {
      const newEntry: Entry = {
        id: `entry-${Date.now()}`,
        code: code.trim().toUpperCase(),
        title: title.trim(),
        category,
        leaderName: leaderName.trim() || members[0] || 'Peserta',
        teamMembers: members.length > 0 ? members : [leaderName || 'Peserta'],
        actualDurationMin: durationMin,
        actualDurationSec: durationSec,
        videoUrl: videoUrl.trim() || undefined,
        submissionDate: new Date().toISOString().slice(0, 10),
        notes: notes.trim() || undefined
      };
      onAddEntry(newEntry);
    }

    resetForm();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-500" />
            Pengurusan Entri Pertandingan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar karya peserta mengikut kategori (Tingkatan 1 hingga Tingkatan 6), durasi dan pautan video.
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => {
              // Pre-generate code recommendation
              const nextNum = entries.length + 1;
              setCode(`VID-${nextNum < 10 ? '0' + nextNum : nextNum}`);
              setIsAdding(true);
            }}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Daftar Entri Baharu</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal / Box */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-amber-400/80 rounded-xl p-6 shadow-md mb-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FilePlus className="w-4 h-4 text-amber-500" />
              {editingEntryId ? 'Kemaskini Maklumat Entri' : 'Borang Pendaftaran Entri Baharu'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kod Video (Cth: VID-A03):
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VID-A03"
                className="w-full bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 text-xs rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tajuk Karya Video:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Bersatu Teguh, Makmur Bersama"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Peserta:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                {rubric.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Ketua Kumpulan / Wakil:
              </label>
              <input
                type="text"
                required
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="Nama pelajar ketua"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Durasi Video (Minit & Saat):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={durationMin}
                  onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
                  className="w-16 bg-slate-50 border border-slate-300 font-mono text-center text-xs rounded px-2 py-2"
                />
                <span className="text-xs font-bold text-slate-500">m</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationSec}
                  onChange={(e) => setDurationSec(parseInt(e.target.value) || 0)}
                  className="w-16 bg-slate-50 border border-slate-300 font-mono text-center text-xs rounded px-2 py-2"
                />
                <span className="text-xs font-bold text-slate-500">s</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Semua Ahli Pasukan (Pisahkan dengan koma, maks 5 orang):
              </label>
              <input
                type="text"
                value={teamMembersText}
                onChange={(e) => setTeamMembersText(e.target.value)}
                placeholder="Ahmad, Tan, Wilson, Samuel"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pautan Video (Google Drive / YouTube):
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/..."
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow"
            >
              {editingEntryId ? 'Simpan Kemaskini' : 'Daftar Entri'}
            </button>
          </div>
        </form>
      )}

      {/* Entries List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                  {entry.code}
                </span>
                <span className="text-xs font-semibold text-amber-700">
                  {entry.category}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1.5 leading-snug">
                {entry.title}
              </h3>

              <div className="text-xs text-slate-600 space-y-1 mb-4">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Ketua: <strong>{entry.leaderName}</strong></span>
                </div>
                <div className="text-[11px] text-slate-500 pl-5">
                  Ahli: {entry.teamMembers.join(', ')}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Durasi: {entry.actualDurationMin}m {entry.actualDurationSec}s</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => startEdit(entry)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                  title="Edit Maklumat"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Adakah anda pasti mahu memadam entri "${entry.code} - ${entry.title}"?`)) {
                      onDeleteEntry(entry.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Padam Entri"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {entry.videoUrl && (
                  <a
                    href={entry.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                    title="Buka Pautan Video"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => onScoreEntry(entry.id)}
                className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow-sm transition-colors"
              >
                Beri Markah
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
