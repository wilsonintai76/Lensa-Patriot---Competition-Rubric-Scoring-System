import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, KeyRound, Check, RefreshCw } from 'lucide-react';
import { Judge } from '../types/rubric';

interface JudgePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  judge: Judge;
  allJudges: Judge[];
  onSelectDifferentJudge?: (judgeId: string) => void;
  onSuccess: () => void;
  actionDescription?: string; // e.g. "menghantar dan mengunci markah" or "menyimpan draf markah"
}

export const JudgePinModal: React.FC<JudgePinModalProps> = ({
  isOpen,
  onClose,
  judge,
  allJudges,
  onSelectDifferentJudge,
  onSuccess,
  actionDescription = 'mengesahkan dan menghantar markah penilaian'
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const expectedPin = judge.pin || '1234';

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg(null);
      setIsVerifying(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, judge.id]);

  if (!isOpen) return null;

  const handleVerify = (inputPin = pin) => {
    setErrorMsg(null);
    if (inputPin.length < 4) {
      setErrorMsg('Sila masukkan 4 digit PIN keselamatan.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (inputPin === expectedPin) {
        setIsVerifying(false);
        onSuccess();
      } else {
        setIsVerifying(false);
        setErrorMsg('PIN tidak sah. Sila semak PIN rasmi hakim ini.');
        setPin('');
        inputRef.current?.focus();
      }
    }, 250);
  };

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        handleVerify(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Pengesahan Identiti Hakim
              </h3>
              <p className="text-[11px] text-slate-400">
                SMK St. Thomas, Kuching
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Identity Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Hakim Semasa
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {judge.name}
              </div>
              <div className="text-xs text-slate-600">
                {judge.role}
              </div>
            </div>

            {onSelectDifferentJudge && allJudges.length > 1 && (
              <div className="text-right">
                <label className="text-[10px] text-slate-400 block mb-0.5">
                  Bukan anda?
                </label>
                <select
                  value={judge.id}
                  onChange={(e) => onSelectDifferentJudge(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  {allJudges.map((j) => (
                    <option key={j.id} value={j.id}>
                      Tukar: {j.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed text-center">
            Sila masukkan kod <strong>4-digit PIN keselamatan</strong> anda untuk {actionDescription} bagi memastikan integriti pemarkahan.
          </p>

          {/* PIN Display & Hidden Input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(val);
                if (val.length === 4) {
                  handleVerify(val);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              autoFocus
            />

            {/* 4 Digit Visual Circles / Boxes */}
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pin.length > index;
                const isCurrent = pin.length === index;
                return (
                  <div
                    key={index}
                    className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-mono font-bold transition-all ${
                      isFilled
                        ? 'border-amber-500 bg-amber-50 text-slate-900 shadow-sm'
                        : isCurrent
                        ? 'border-slate-900 bg-white shadow-inner ring-2 ring-amber-400/30'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {isFilled ? '•' : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Numeric Keypad for Touch / Mouse */}
          <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigitClick(digit)}
                className="h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono font-bold text-base transition-colors flex items-center justify-center shadow-xs active:bg-amber-400 active:text-slate-950"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors flex items-center justify-center"
            >
              Padam
            </button>
            <button
              type="button"
              onClick={() => handleDigitClick('0')}
              className="h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono font-bold text-base transition-colors flex items-center justify-center active:bg-amber-400 active:text-slate-950"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors flex items-center justify-center"
            >
              ←
            </button>
          </div>

          {/* Demo Testing Helper Pill */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 text-center">
            <div className="text-[11px] font-bold text-amber-900 mb-0.5">
              💡 Bantuan Ujian Demo (PIN Rasmi Hakim):
            </div>
            <div className="text-[10px] text-amber-800 space-x-2 font-mono">
              <span>Pn. Gwen: <strong>1111</strong></span>
              <span>·</span>
              <span>Cg. Ajien: <strong>2222</strong></span>
              <span>·</span>
              <span>Dr. Wilson: <strong>3333</strong></span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isVerifying || pin.length < 4}
              onClick={() => handleVerify()}
              className="w-2/3 py-2.5 px-4 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow transition-colors flex items-center justify-center gap-1.5"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengesahkan...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sahkan PIN & Teruskan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
