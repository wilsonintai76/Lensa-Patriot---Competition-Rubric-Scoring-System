import React from 'react';
import { X, Award, AlertTriangle, ShieldCheck, Film, Calendar, Phone, CheckCircle2 } from 'lucide-react';
import { RubricConfig } from '../types/rubric';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rubric: RubricConfig;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, rubric }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="text-xs uppercase font-bold text-amber-400">
              {rubric.schoolName}
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              {rubric.title} — Syarat Pertandingan & Rubrik Rasmi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Theme & Highlight Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="font-bold text-slate-900 text-sm mb-1">
              Tema: "{rubric.theme}"
            </div>
            <div className="text-amber-900">
              Tarikh Tutup Penghantaran Video: <strong>4 September 2026</strong>
            </div>
          </div>

          {/* Prizes Section */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-500" />
              Hadiah Pemenang (Baucar Koperasi Sekolah):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-amber-100/70 border border-amber-300 rounded-lg p-3 text-center">
                <div className="font-bold text-amber-900">Tempat Pertama</div>
                <div className="text-lg font-mono font-extrabold text-amber-950">RM200</div>
                <div className="text-[10px] text-amber-800">Baucar Koperasi</div>
              </div>
              <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-center">
                <div className="font-bold text-slate-800">Tempat Kedua</div>
                <div className="text-lg font-mono font-extrabold text-slate-900">RM150</div>
                <div className="text-[10px] text-slate-600">Baucar Koperasi</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <div className="font-bold text-amber-800">Tempat Ketiga</div>
                <div className="text-lg font-mono font-extrabold text-amber-900">RM100</div>
                <div className="text-[10px] text-amber-700">Baucar Koperasi</div>
              </div>
            </div>
          </div>

          {/* Participation Requirements */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Syarat-Syarat Penyertaan Rasmi:
            </h4>
            <ul className="space-y-2 list-none pl-0">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Sasaran Peserta:</strong> Terbuka kepada semua pelajar SMK St. Thomas secara individu atau berkumpulan (maksimum 5 orang).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Durasi Video:</strong> Mesti berdurasi <strong>2 hingga 3 minit</strong> (termasuk montaj dan kredit penghargaan).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Keaslian:</strong> Kandungan video mestilah asli dan tidak pernah disiarkan di mana-mana platform awam.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Format & Orientasi:</strong> Video perlu dihantar dalam format <code>.mp4</code>, orientasi melintang (<em>landscape</em>).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Peranti:</strong> Pelajar bebas menggunakan sebarang peranti rakaman seperti kamera DSLR, kamera digital atau telefon pintar.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Bahasa:</strong> Bahasa Melayu atau Bahasa Inggeris dibenarkan.</span>
              </li>
            </ul>
          </div>

          {/* Gatekeeper & 3R Alert */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg space-y-1">
            <h5 className="font-bold text-red-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Nota Penting: Sensitiviti Isu (3R) & Keaslian
            </h5>
            <p className="text-red-700 text-xs">
              Karya <strong>tidak boleh menyentuh isu sensitif</strong> (perkauman, agama, institusi diraja atau politik berbaur provokasi). Penyertaan yang melanggar syarat ini akan <strong>terbatal secara automatik (Disqualified)</strong>.
            </p>
          </div>

          {/* Time Penalty Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">
              Jadual Penalti Durasi Masa:
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-800">
                  <tr>
                    <th className="p-2.5">Keadaan Durasi</th>
                    <th className="p-2.5">Penalti Markah</th>
                    <th className="p-2.5">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5">Kurang 1:45 minit ATAU lebih 3:15 minit</td>
                    <td className="p-2.5 font-bold text-amber-700 font-mono">-5 Markah</td>
                    <td className="p-2.5 text-slate-600">Ditolak daripada Markah Kasar</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Kurang 1:30 minit ATAU lebih 3:30 minit</td>
                    <td className="p-2.5 font-bold text-red-700 font-mono">-10 Markah</td>
                    <td className="p-2.5 text-slate-600">Ditolak daripada Markah Kasar</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Coordinators Contact */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900">Urusetia & Guru Penyelaras:</div>
              <div className="text-slate-600 mt-0.5">
                • <strong>Pn. Gwen</strong> (Guru Penyelaras)<br />
                • <strong>Cg. Ajien</strong> (Guru Penyelaras)
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              SMK St. Thomas, Kuching, Sarawak<br />
              <em>"Aim Higher"</em>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded shadow transition-colors"
          >
            Faham & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
