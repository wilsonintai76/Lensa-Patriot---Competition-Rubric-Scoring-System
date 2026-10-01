import React, { useState } from 'react';
import {
  X,
  QrCode,
  Search,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Entry } from '../types/rubric';

interface JudgeQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: Entry[];
  onSelectEntry: (entryId: string) => void;
}

export const JudgeQRScannerModal: React.FC<JudgeQRScannerModalProps> = ({
  isOpen,
  onClose,
  entries,
  onSelectEntry
}) => {
  const [scanInput, setScanInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const raw = scanInput.trim();
    if (!raw) return;

    // Check if it's a URL with code parameter
    let extractedCode = raw;
    try {
      if (raw.includes('code=')) {
        const url = new URL(raw);
        extractedCode = url.searchParams.get('code') || raw;
      }
    } catch {
      // not a full url, keep as raw string
    }

    const matched = entries.find(
      (entry) =>
        entry.code.toLowerCase() === extractedCode.toLowerCase() ||
        entry.id.toLowerCase() === extractedCode.toLowerCase() ||
        entry.title.toLowerCase().includes(extractedCode.toLowerCase())
    );

    if (matched) {
      onSelectEntry(matched.id);
      onClose();
    } else {
      setErrorMsg(`Tiada karya video ditemui untuk kod/imbasan "${raw}". Sila semak semula.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/40">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Imbas / Masukkan Kod QR Peserta
              </h3>
              <p className="text-[11px] text-slate-400">
                Buka borang pemarkahan video serta-merta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Simulated Scanner Viewport Frame */}
          <div className="bg-slate-950 rounded-xl p-6 text-center text-white relative overflow-hidden border border-slate-800 shadow-inner">
            <div className="w-40 h-40 mx-auto border-2 border-amber-400/80 rounded-xl relative flex flex-col items-center justify-center bg-slate-900/60">
              {/* Corner Targets */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

              <QrCode className="w-12 h-12 text-amber-400/60 animate-pulse" />
              <span className="text-[10px] text-amber-300/80 mt-2 font-mono">
                PENGIMBAS AKTIF
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Halakan kamera ke Kod QR pada Pas Peserta atau masukkan kod di bawah
            </p>
          </div>

          {/* Code Input Form */}
          <form onSubmit={handleScanSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Masukkan Kod Entri / Hasil Imbasan QR:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Contoh: VID-A01, VID-B02..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Buka</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 p-2 rounded-lg flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>

          {/* Quick Click Shortcut List */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block">
              Pilihan Pantas Karya Video Tersedia:
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {entries.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    onSelectEntry(e.id);
                    onClose();
                  }}
                  className="p-2 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <div className="font-mono font-bold text-slate-900 text-[11px]">{e.code}</div>
                  <div className="text-[10px] text-slate-500 truncate">{e.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
