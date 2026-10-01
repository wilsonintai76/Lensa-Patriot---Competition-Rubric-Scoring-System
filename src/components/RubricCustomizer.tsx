import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Criterion, GatekeeperItem, RubricConfig } from '../types/rubric';
import { DEFAULT_RUBRIC_CONFIG, PRESET_RUBRICS } from '../data/defaultData';

interface RubricCustomizerProps {
  rubric: RubricConfig;
  onUpdateRubric: (newRubric: RubricConfig) => void;
}

export const RubricCustomizer: React.FC<RubricCustomizerProps> = ({
  rubric,
  onUpdateRubric
}) => {
  const [editingRubric, setEditingRubric] = useState<RubricConfig>(rubric);
  const [activePreset, setActivePreset] = useState<string>('lensa-patriot');
  const [expandedCritId, setExpandedCritId] = useState<string | null>(editingRubric.criteria[0]?.id || null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Calculate sum of weights
  const totalWeight = editingRubric.criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const isWeightValid = totalWeight === 100;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Add new criterion
  const handleAddCriterion = () => {
    const newId = `crit-${Date.now()}`;
    const newCriterion: Criterion = {
      id: newId,
      name: 'Kriteria Baharu',
      focus: 'Fokus dan aspek yang dinilai...',
      weight: 10,
      multiplier: 2,
      descriptors: {
        1: { levelName: 'Sangat Lemah', text: 'Gagal mencapai standard minimum...' },
        2: { levelName: 'Kurang Memuaskan', text: 'Terdapat cubaan tetapi lemah...' },
        3: { levelName: 'Memuaskan', text: 'Mencapai standard asas dengan baik...' },
        4: { levelName: 'Baik', text: 'Persembahan kukuh dan bermutu tinggi...' },
        5: { levelName: 'Cemerlang', text: 'Pencapaian luar biasa dan istimewa...' }
      }
    };
    setEditingRubric((prev) => ({
      ...prev,
      criteria: [...prev.criteria, newCriterion]
    }));
    setExpandedCritId(newId);
    showToast('Kriteria baharu ditambah. Sila laraskan wajaran.');
  };

  // Delete criterion
  const handleDeleteCriterion = (id: string) => {
    if (editingRubric.criteria.length <= 1) {
      alert('Pertandingan memerlukan sekurang-kurangnya 1 kriteria penilaian.');
      return;
    }
    setEditingRubric((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((c) => c.id !== id)
    }));
    showToast('Kriteria dipadam.');
  };

  // Update criterion field
  const handleUpdateCriterion = (
    id: string,
    field: keyof Criterion,
    val: string | number
  ) => {
    setEditingRubric((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c) => {
        if (c.id === id) {
          const updated = { ...c, [field]: val };
          if (field === 'weight') {
            const numWeight = Number(val) || 0;
            updated.multiplier = Math.round((numWeight / 5) * 10) / 10;
          }
          return updated;
        }
        return c;
      })
    }));
  };

  // Update descriptor text for a level
  const handleUpdateDescriptor = (
    critId: string,
    level: number,
    text: string
  ) => {
    setEditingRubric((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c) => {
        if (c.id === critId) {
          return {
            ...c,
            descriptors: {
              ...c.descriptors,
              [level]: {
                ...c.descriptors[level],
                text
              }
            }
          };
        }
        return c;
      })
    }));
  };

  // Save changes
  const handleSaveAll = () => {
    if (!isWeightValid) {
      alert(`Perhatian: Jumlah wajaran kriteria ialah ${totalWeight}%. Sila pastikan jumlah tepat 100% sebelum menyimpan.`);
      return;
    }
    onUpdateRubric(editingRubric);
    showToast('Rubrik pertandingan berjaya dikemaskini dan disimpan!');
  };

  // Switch preset
  const handleLoadPreset = (key: string) => {
    if (PRESET_RUBRICS[key]) {
      setActivePreset(key);
      setEditingRubric(JSON.parse(JSON.stringify(PRESET_RUBRICS[key])));
      setExpandedCritId(PRESET_RUBRICS[key].criteria[0]?.id || null);
      showToast(`Templat "${PRESET_RUBRICS[key].title}" dimuatkan.`);
    }
  };

  // Reset to default
  const handleResetDefault = () => {
    setEditingRubric(JSON.parse(JSON.stringify(DEFAULT_RUBRIC_CONFIG)));
    setActivePreset('lensa-patriot');
    setExpandedCritId(DEFAULT_RUBRIC_CONFIG.criteria[0]?.id || null);
    showToast('Rubrik disetkan semula ke templat asal SMK St. Thomas.');
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(editingRubric, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rubrik_${editingRubric.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.criteria && parsed.title) {
            setEditingRubric(parsed);
            onUpdateRubric(parsed);
            showToast('Konfigurasi rubrik berjaya diimport daripada fail JSON!');
          } else {
            alert('Fail JSON tidak mengandungi format rubrik yang sah.');
          }
        } catch (err) {
          alert('Ralat membaca fail JSON.');
        }
      };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-amber-500/50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header and Presets Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              Tetapan & Penyesuaian Rubrik Pemarkahan
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Laraskan wajaran kriteria, tambah kategori baru, ubah suai huraian deskriptor Likert atau pilih templat pertandingan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tetapan Asal</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5"
              title="Muat Turun Skema Rubrik JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksport JSON</span>
            </button>

            <label className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Presets Row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            Templat Pra-tetap:
          </span>
          <button
            type="button"
            onClick={() => handleLoadPreset('lensa-patriot')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activePreset === 'lensa-patriot'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Video Pendek "Lensa Patriot" (SMK St. Thomas)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('poster-infografik')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activePreset === 'poster-infografik'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Poster & Infografik Digital
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('pidato-madani')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activePreset === 'pidato-madani'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pidato & Pengucapan Awam
          </button>
        </div>

        {/* Weight Validation Meter */}
        <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              Jumlah Wajaran Kriteria:
            </span>
            <span
              className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                isWeightValid
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {totalWeight}% / 100%
            </span>
            {isWeightValid ? (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Wajaran seimbang & sah
              </span>
            ) : (
              <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Perlu tepat 100% (Beza: {100 - totalWeight}%)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddCriterion}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Tambah Kriteria Baharu</span>
          </button>
        </div>
      </div>

      {/* Criteria Cards List */}
      <div className="space-y-4 mb-8">
        {editingRubric.criteria.map((crit, index) => {
          const isExpanded = expandedCritId === crit.id;
          return (
            <div
              key={crit.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all"
            >
              {/* Criterion Header Summary */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-md bg-amber-100 text-amber-900 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {crit.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                      {crit.focus}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 font-medium">Wajaran:</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="5"
                        max="100"
                        step="5"
                        value={crit.weight}
                        onChange={(e) =>
                          handleUpdateCriterion(crit.id, 'weight', parseInt(e.target.value) || 0)
                        }
                        className="w-16 bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 text-xs rounded px-2 py-1 text-center focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                      <span className="text-xs text-slate-600 font-bold">%</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      (×{crit.multiplier})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedCritId(isExpanded ? null : crit.id)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                    title={isExpanded ? 'Tutup Deskriptor' : 'Urus Deskriptor'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCriterion(crit.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Padam Kriteria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Edit Form */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-4">
                  {/* Criterion Metadata Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Kriteria Penilaian:
                      </label>
                      <input
                        type="text"
                        value={crit.name}
                        onChange={(e) => handleUpdateCriterion(crit.id, 'name', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Fokus & Huraian Aspek Penilaian:
                      </label>
                      <input
                        type="text"
                        value={crit.focus}
                        onChange={(e) => handleUpdateCriterion(crit.id, 'focus', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Level Descriptors Editor (1 to 5) */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Deskriptor Rubrik Skala Likert (Tahap 1 hingga 5):
                    </h4>
                    <div className="space-y-2.5">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const desc = crit.descriptors[lvl] || {
                          levelName: `Tahap ${lvl}`,
                          text: ''
                        };
                        return (
                          <div
                            key={lvl}
                            className="flex flex-col sm:flex-row sm:items-start gap-2 bg-white p-3 rounded-lg border border-slate-200"
                          >
                            <div className="w-36 shrink-0">
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                  Skor {lvl}
                                </span>
                                <span>{desc.levelName}</span>
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Nilai: {lvl * crit.multiplier} markah
                              </div>
                            </div>
                            <textarea
                              rows={2}
                              value={desc.text}
                              onChange={(e) =>
                                handleUpdateDescriptor(crit.id, lvl, e.target.value)
                              }
                              placeholder={`Huraian kualiti bagi skor ${lvl}...`}
                              className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Gatekeeper Conditions Editor */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Syarat Wajib Asas (Gatekeeper Requirements)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Syarat yang mesti disemak hakim sebelum penilaian markah teknikal dimulakan.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {editingRubric.gatekeepers.map((gk, idx) => (
            <div
              key={gk.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-500">
                    {idx + 1}.
                  </span>
                  <span className="font-bold text-slate-900">
                    {gk.criterionText}
                  </span>
                  {gk.autoDisqualifyOnFail && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                      Gagal = Terbatal
                    </span>
                  )}
                </div>
                <p className="text-slate-600 pl-4">{gk.ruleNote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
