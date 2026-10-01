import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Entry, Judge, RubricConfig, Scorecard, ConsolidatedLeaderboardRow } from '../types/rubric';

// Helper to sanitize text for PDF
function safeText(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val);
}

export function exportScorecardPDF(
  entry: Entry,
  scorecard: Scorecard,
  judge: Judge,
  rubric: RubricConfig
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Gold accent line
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(0, 24, pageWidth, 1.5, 'F');

  // School & Event Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(rubric.schoolName, pageWidth / 2, 8, { align: 'center' });

  doc.setFontSize(13);
  doc.text(rubric.title.toUpperCase(), pageWidth / 2, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`TEMA: "${rubric.theme}" • ${rubric.subtitle}`, pageWidth / 2, 19.5, { align: 'center' });

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('BORANG PEMARKAHAN HAKIM (SCORECARD INDIVIDU)', 14, 33);

  // Metadata Grid
  const metaStartX = 14;
  const metaStartY = 37;
  const colWidth = (pageWidth - 28) / 2;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(metaStartX, metaStartY, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Nama Hakim:', metaStartX + 4, metaStartY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(judge.name + (judge.role ? ` (${judge.role})` : ''), metaStartX + 28, metaStartY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Kod / Tajuk Video:', metaStartX + 4, metaStartY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const titleText = `${entry.code} - ${entry.title}`;
  doc.text(titleText.length > 40 ? titleText.substring(0, 38) + '...' : titleText, metaStartX + 34, metaStartY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Kategori Peserta:', metaStartX + 4, metaStartY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(entry.category, metaStartX + 32, metaStartY + 18);

  // Right column
  const rightColX = metaStartX + colWidth + 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Durasi Video:', rightColX, metaStartY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${scorecard.actualDurationMin}m ${scorecard.actualDurationSec}s`, rightColX + 24, metaStartY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Ketua / Pasukan:', rightColX, metaStartY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(entry.leaderName || 'Individu', rightColX + 28, metaStartY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Status Kelayakan:', rightColX, metaStartY + 18);
  if (scorecard.isDisqualified) {
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('TERBATAL / DISQUALIFIED', rightColX + 30, metaStartY + 18);
  } else {
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('LAYAK (Mematuhi Syarat)', rightColX + 30, metaStartY + 18);
  }

  // Section 1: Gatekeeper Table
  let currentY = 64;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Senarai Semak Kelayakan Asas (Syarat Wajib / Gatekeeper)', 14, currentY);

  const gatekeeperRows = rubric.gatekeepers.map((gk, index) => {
    const passed = scorecard.gatekeeperStatus[gk.id] !== false;
    return [
      String(index + 1),
      gk.criterionText,
      gk.ruleNote,
      passed ? 'YA (LULUS)' : 'TIDAK (GAGAL)'
    ];
  });

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Bil', 'Kriteria Pematuhan Syarat', 'Catatan / Huraian', 'Status']],
    body: gatekeeperRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 105 },
      3: { cellWidth: 28, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        if (data.cell.raw === 'YA (LULUS)') {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    }
  });

  // Section 2: Detailed Scoring Table
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  currentY = doc.lastAutoTable.finalY + 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Jadual Pemarkahan Rubrik Likert (1–5)', 14, currentY);

  const scoringRows = rubric.criteria.map((crit, index) => {
    const likert = scorecard.criteriaScores[crit.id] || 0;
    const markObtained = likert * crit.multiplier;
    const maxMark = 5 * crit.multiplier;
    return [
      String(index + 1),
      `${crit.name}\n(${crit.focus})`,
      `${crit.weight}%`,
      String(likert),
      `x ${crit.multiplier}`,
      `${markObtained} / ${maxMark}`
    ];
  });

  // Append summary row
  scoringRows.push([
    '',
    'JUMLAH MARKAH KASAR',
    '100%',
    '',
    '',
    `${scorecard.grossScore} / 100`
  ]);

  if (scorecard.durationPenalty > 0) {
    scoringRows.push([
      '',
      `TOLAK PENALTI DURASI (${scorecard.actualDurationMin}m ${scorecard.actualDurationSec}s melepasi had masa)`,
      '-',
      '',
      '',
      `-${scorecard.durationPenalty} markah`
    ]);
  }

  scoringRows.push([
    '',
    'JUMLAH MARKAH AKHIR (BERSIH)',
    '100%',
    '',
    '',
    `${scorecard.finalScore} / 100`
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Bil', 'Kriteria Penilaian', 'Wajaran', 'Skor Likert', 'Pengganda', 'Markah Diperoleh']],
    body: scoringRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 85 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 26, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      // Highlight total summary rows
      if (data.section === 'body' && data.row.index >= rubric.criteria.length) {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 5 && data.row.index === scoringRows.length - 1) {
          data.cell.styles.textColor = [15, 23, 42];
          data.cell.styles.fillColor = [254, 243, 199]; // light amber
        }
      }
    }
  });

  // Section 3: Qualitative Feedback
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  currentY = doc.lastAutoTable.finalY + 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. Ulasan & Maklum Balas Kualitatif Hakim', 14, currentY);

  currentY += 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Kekuatan Utama Karya:', 17, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const strengthsLines = doc.splitTextToSize(
    scorecard.qualitativeFeedback?.strengths || 'Tiada ulasan khusus dicatatkan.',
    pageWidth - 36
  );
  doc.text(strengthsLines, 17, currentY + 9.5);

  const impY = currentY + 15;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Aspek Penambahbaikan:', 17, impY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const impLines = doc.splitTextToSize(
    scorecard.qualitativeFeedback?.improvements || 'Tiada catatan penambahbaikan.',
    pageWidth - 36
  );
  doc.text(impLines, 17, impY + 4.5);

  // Section 4: Sign-off Box
  currentY += 32;
  const signBoxWidth = (pageWidth - 28) / 2;

  // Left: Judge Sign
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Tandatangan Hakim Penilai:', 14, currentY);
  doc.line(14, currentY + 14, 14 + signBoxWidth - 10, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(judge.name, 14, currentY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Tarikh: ${scorecard.updatedAt || new Date().toISOString().slice(0, 10)}`, 14, currentY + 23);

  // Right: Coordinator / St. Thomas Seal
  const rightSignX = 14 + signBoxWidth + 5;
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Disahkan Oleh Guru Penyelaras / Urusetia:', rightSignX, currentY);
  doc.line(rightSignX, currentY + 14, rightSignX + signBoxWidth - 10, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Pn. Gwen / Cg. Ajien', rightSignX, currentY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SMK St. Thomas, Kuching', rightSignX, currentY + 23);

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen Rasmi Pertandingan Lensa Patriot • Dicetak Secara Automatik Melalui Sistem Pemarkahan SMK St. Thomas', pageWidth / 2, 290, { align: 'center' });

  // Download trigger
  const fileName = `Scorecard_${entry.code}_${judge.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

export function exportLeaderboardPDF(
  rows: ConsolidatedLeaderboardRow[],
  activeCategory: string,
  rubric: RubricConfig,
  judges: Judge[]
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Gold accent line
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(0, 26, pageWidth, 1.5, 'F');

  // Text inside banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(rubric.schoolName, pageWidth / 2, 8, { align: 'center' });

  doc.setFontSize(14);
  doc.text(`${rubric.title.toUpperCase()} — KEPUTUSAN RASMI PERTANDINGAN`, pageWidth / 2, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text(`TEMA: "${rubric.theme}" • KATEGORI: ${activeCategory.toUpperCase()}`, pageWidth / 2, 21.5, { align: 'center' });

  // Sub-bar info
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  const now = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.text(`Tarikh Cetakan: ${now} • Jumlah Penyertaan Dinilai: ${rows.length} • Panel Penilai: ${judges.map(j => j.name).join(', ')}`, 14, 34);

  // Table rows
  const tableData = rows.map((r) => {
    let rankBadge = String(r.rank);
    if (r.rank === 1) rankBadge = 'JUARA (1)';
    else if (r.rank === 2) rankBadge = 'NAIB JUARA (2)';
    else if (r.rank === 3) rankBadge = 'KETIGA (3)';

    const actualDuration = `${r.entry.actualDurationMin}m ${r.entry.actualDurationSec}s`;
    const penaltyText = r.avgPenalty > 0 ? `-${r.avgPenalty}m` : '0';
    const statusText = r.isDisqualified ? 'TERBATAL (3R/Syarat)' : 'LAYAK';
    const prizeText = r.prize || (r.rank <= 3 ? `Baucar Koperasi` : '-');

    return [
      rankBadge,
      r.entry.code,
      r.entry.title,
      r.entry.category,
      r.entry.leaderName || '-',
      actualDuration,
      `${r.avgGrossScore.toFixed(1)} m`,
      penaltyText,
      `${r.avgFinalScore.toFixed(1)} / 100`,
      statusText,
      prizeText
    ];
  });

  autoTable(doc, {
    startY: 38,
    head: [[
      'Kedudukan',
      'Kod',
      'Tajuk Video',
      'Kategori',
      'Ketua / Wakil',
      'Durasi',
      'Markah Kasar',
      'Penalti',
      'Markah Akhir',
      'Status',
      'Hadiah / Anugerah'
    ]],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 41, 59] },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 62 },
      3: { cellWidth: 24 },
      4: { cellWidth: 32 },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' },
      7: { cellWidth: 16, halign: 'center' },
      8: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
      9: { cellWidth: 22, halign: 'center' },
      10: { cellWidth: 28, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const row = rows[data.row.index];
        if (row?.rank === 1) {
          data.cell.styles.fillColor = [254, 243, 199]; // gold highlight
        } else if (row?.rank === 2) {
          data.cell.styles.fillColor = [241, 245, 249]; // silver
        } else if (row?.rank === 3) {
          data.cell.styles.fillColor = [255, 237, 213]; // bronze
        }
        if (data.column.index === 9 && row?.isDisqualified) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // Signature Block at Bottom
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  const endY = doc.lastAutoTable.finalY + 12;

  if (endY < 175) {
    const colW = (pageWidth - 28) / 3;

    // Sign 1: Ketua Panel Juri
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Disahkan Oleh Ketua Panel Hakim:', 14, endY);
    doc.line(14, endY + 14, 14 + colW - 10, endY + 14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Dr. Wilson Intai', 14, endY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Ketua Panel Penilai Pertandingan', 14, endY + 22);

    // Sign 2: Guru Penyelaras
    const col2X = 14 + colW;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Guru Penyelaras:', col2X, endY);
    doc.line(col2X, endY + 14, col2X + colW - 10, endY + 14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Pn. Gwen / Cg. Ajien', col2X, endY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Penyelaras Lensa Patriot SMK St. Thomas', col2X, endY + 22);

    // Sign 3: Pengetua
    const col3X = 14 + colW * 2;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Pengesahan Pentadbiran Sekolah:', col3X, endY);
    doc.line(col3X, endY + 14, col3X + colW - 10, endY + 14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Pengetua / PK Kokurikulum', col3X, endY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('SMK St. Thomas, Kuching', col3X, endY + 22);
  }

  // Footer note
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Keputusan Juri Adalah Muktamad • Hak Cipta Terpelihara SMK St. Thomas, Kuching', pageWidth / 2, 200, { align: 'center' });

  const catSanitized = activeCategory.replace(/\s+/g, '_');
  doc.save(`Keputusan_Rasmi_Lensa_Patriot_${catSanitized}.pdf`);
}
