import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Scale,
  Sparkles
} from 'lucide-react';
import { Entry, RubricConfig } from '../types/rubric';

interface ParticipantQRCodeModalProps {
  entry: Entry | null;
  isOpen: boolean;
  onClose: () => void;
  rubric: RubricConfig;
  onOpenInJudgeView?: (entryId: string) => void;
}

export const ParticipantQRCodeModal: React.FC<ParticipantQRCodeModalProps> = ({
  entry,
  isOpen,
  onClose,
  rubric,
  onOpenInJudgeView
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const directUrl = entry
    ? `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(entry.code)}&role=hakim`
    : '';

  useEffect(() => {
    if (!entry || !isOpen) return;

    // Generate high-resolution QR code
    QRCode.toDataURL(
      directUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a', // slate-900
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      },
      (err, url) => {
        if (err) {
          console.error('Failed to generate QR code:', err);
        } else {
          setQrDataUrl(url);
        }
      }
    );
  }, [entry, isOpen, directUrl]);

  if (!isOpen || !entry) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${entry.code}_${entry.leaderName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/40">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Pas Kod QR Penjurian Peserta
              </h3>
              <p className="text-[11px] text-slate-400">
                Imbas untuk membuka butiran & borang skor juri
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

        {/* Modal Content / Printable Pass Card */}
        <div className="p-6 space-y-5 text-center">
          {/* Badge & School Header */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-widest text-amber-700 bg-amber-50 border border-amber-200 py-0.5 px-2.5 rounded-full inline-block">
              {rubric.schoolName} · Lensa Patriot 2026
            </div>
            <h4 className="text-base font-extrabold text-slate-900 pt-1 line-clamp-1">
              {entry.title}
            </h4>
            <div className="text-xs text-slate-500">
              Ketua: <strong className="text-slate-800">{entry.leaderName}</strong> · {entry.category}
            </div>
          </div>

          {/* QR Code Presentation Box */}
          <div className="bg-gradient-to-b from-slate-50 to-amber-50/40 border-2 border-amber-300 rounded-2xl p-5 max-w-[280px] mx-auto shadow-inner flex flex-col items-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Kod QR Entri ${entry.code}`}
                className="w-48 h-48 rounded-xl shadow-xs bg-white p-2 border border-slate-200"
              />
            ) : (
              <div className="w-48 h-48 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                Menjana Kod QR...
              </div>
            )}

            <div className="mt-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                Kod Unik Entri
              </span>
              <span className="text-xl font-mono font-extrabold text-slate-900">
                {entry.code}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Panel hakim boleh menghalakan kamera telefon / tablet pada kod ini untuk terus membuka borang pemarkahan video ini.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Muat Turun PNG</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salin Pautan</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo: Open in Judge Scoring View */}
          {onOpenInJudgeView && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onOpenInJudgeView(entry.id);
                  onClose();
                }}
                className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Scale className="w-4 h-4 text-slate-950" />
                <span>Simulasi Imbas: Buka Penjurian Hakim</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
