import { RubricConfig, Entry, Judge, Scorecard } from '../types/rubric';

export const DEFAULT_RUBRIC_CONFIG: RubricConfig = {
  id: 'lensa-patriot-2026',
  title: 'Pertandingan Video Pendek "Lensa Patriot"',
  subtitle: 'Borang & Rubrik Penilaian Skala Likert (1–5)',
  schoolName: 'SMK ST. THOMAS, KUCHING',
  motto: 'Aim Higher • Kreatif, Inovatif, Patriotik',
  theme: 'Malaysia Madani, Kesejahteraan Dinikmati',
  targetDurationMinSec: [2, 3],
  categories: [
    {
      id: 'Kategori A',
      name: 'Kategori A: Tingkatan 6',
      description: 'Pelajar Pra-Universiti / Tingkatan 6 Atas & Bawah',
      prizeFirst: 'RM200 (Baucar Koperasi)',
      prizeSecond: 'RM150 (Baucar Koperasi)',
      prizeThird: 'RM100 (Baucar Koperasi)'
    },
    {
      id: 'Kategori B',
      name: 'Kategori B: Tingkatan 3 – 5',
      description: 'Pelajar Menengah Atas (Tingkatan 3 hingga Tingkatan 5)',
      prizeFirst: 'RM200 (Baucar Koperasi)',
      prizeSecond: 'RM150 (Baucar Koperasi)',
      prizeThird: 'RM100 (Baucar Koperasi)'
    },
    {
      id: 'Kategori C',
      name: 'Kategori C: Tingkatan 1 – 2',
      description: 'Pelajar Menengah Rendah (Tingkatan 1 & Tingkatan 2)',
      prizeFirst: 'RM200 (Baucar Koperasi)',
      prizeSecond: 'RM150 (Baucar Koperasi)',
      prizeThird: 'RM100 (Baucar Koperasi)'
    }
  ],
  gatekeepers: [
    {
      id: 'gk-1',
      criterionText: 'Kelayakan Peserta',
      ruleNote: 'Pelajar berdaftar SMK St. Thomas (Individu / Kumpulan ≤ 5 orang). Tidak layak jika luar sekolah / melebihi 5 orang.',
      isMandatoryToPass: true,
      autoDisqualifyOnFail: true
    },
    {
      id: 'gk-2',
      criterionText: 'Durasi Video',
      ruleNote: '2:00 hingga 3:00 minit (termasuk penghargaan/kredit). Penalti markah jika melepasi toleransi masa.',
      isMandatoryToPass: true,
      autoDisqualifyOnFail: false
    },
    {
      id: 'gk-3',
      criterionText: 'Format & Orientasi Fail',
      ruleNote: 'Format .mp4 dan orientasi mendatar (landscape). Diminta hantar semula jika format tidak serasi.',
      isMandatoryToPass: true,
      autoDisqualifyOnFail: false
    },
    {
      id: 'gk-4',
      criterionText: 'Keaslian & Hak Cipta',
      ruleNote: 'Karya asli, bukan ciplakan dan belum pernah disiarkan di mana-mana platform awam. Penyertaan terbatal serta-merta jika plagiat.',
      isMandatoryToPass: true,
      autoDisqualifyOnFail: true
    },
    {
      id: 'gk-5',
      criterionText: 'Sensitiviti Isu (3R)',
      ruleNote: 'Bebas daripada unsur sensitif (Kaum, Agama, Institusi Diraja/Politik berbaur provokasi). Penyertaan terbatal automatik jika melanggar.',
      isMandatoryToPass: true,
      autoDisqualifyOnFail: true
    }
  ],
  criteria: [
    {
      id: 'crit-1',
      name: 'Kesesuaian dengan Tema',
      focus: 'Ketepatan interpretasi tema "Malaysia Madani, Kesejahteraan Dinikmati", penyampaian mesej perpaduan, keharmonian dan semangat patriotik.',
      weight: 30,
      multiplier: 6,
      descriptors: {
        1: {
          levelName: 'Sangat Lemah',
          text: 'Kandungan video langsung tidak menyentuh tema; mesej patriotik tidak wujud atau mengelirukan penonton.'
        },
        2: {
          levelName: 'Kurang Memuaskan',
          text: 'Tema hanya disentuh secara luaran/sampingan (cth. sekadar meletakkan bendera); mesej perpaduan lemah dan kabur.'
        },
        3: {
          levelName: 'Memuaskan',
          text: 'Tema diterjemahkan dengan jelas pada tahap literal; mesej perpaduan dan nilai Madani difahami walaupun kurang mendalam.'
        },
        4: {
          levelName: 'Baik',
          text: 'Interpretasi tema yang meyakinkan; mesej perpaduan dan kemakmuran dihuraikan dengan berkesan dan mempunyai kesinambungan plot yang kukuh.'
        },
        5: {
          levelName: 'Cemerlang',
          text: 'Penghayatan tema yang sangat matang, mendalam dan penuh makna; mesej patriotik berimpak tinggi serta berjaya memberi inspirasi kepada warga sekolah dan masyarakat.'
        }
      }
    },
    {
      id: 'crit-2',
      name: 'Kreativiti dan Inovasi',
      focus: 'Keunikan idea, kelainan gaya penceritaan (storytelling), keberkesanan plot, dan penggunaan teknik sinematografi yang inovatif.',
      weight: 30,
      multiplier: 6,
      descriptors: {
        1: {
          levelName: 'Sangat Lemah',
          text: 'Idea klise/kering tanpa struktur cerita yang teratur; montaj rawak tanpa arah penceritaan yang jelas.'
        },
        2: {
          levelName: 'Kurang Memuaskan',
          text: 'Jalan cerita agak mendatar dan mudah dijangka; sudut rakaman terhad, gaya penyampaian kurang menarik perhatian.'
        },
        3: {
          levelName: 'Memuaskan',
          text: 'Struktur naratif yang lengkap (permulaan, konflik, pengakhiran); susunan syot dan konsep cerita kemas dan mudah diikuti.'
        },
        4: {
          levelName: 'Baik',
          text: 'Pendekatan cerita yang segar dan asli; penggunaan sudut kamera bervariasi (angles, movement) yang menyokong dinamik jalan cerita.'
        },
        5: {
          levelName: 'Cemerlang',
          text: 'Konsep dan jalan cerita luar biasa unik; sinematografi artistik, teknik penceritaan memukau, luar kotak (out-of-the-box) dan meninggalkan kesan mendalam.'
        }
      }
    },
    {
      id: 'crit-3',
      name: 'Kualiti Teknikal',
      focus: 'Kualiti rakaman (ketajaman, pencahayaan, kestabilan kamera), kemasan suntingan (cut, peralihan, kesan visual), kejelasan audio (dialog, suara latar, muzik latar seimbang).',
      weight: 20,
      multiplier: 4,
      descriptors: {
        1: {
          levelName: 'Sangat Lemah',
          text: 'Video kabur (out of focus), rakaman bergegar teruk; audio bising (noise berlebihan), dialog tidak dapat didengari.'
        },
        2: {
          levelName: 'Kurang Memuaskan',
          text: 'Pencahayaan malap atau berlebihan (overexposed); audio tidak seimbang (muzik menenggelamkan suara watak); suntingan kasar/tersekat-sekat.'
        },
        3: {
          levelName: 'Memuaskan',
          text: 'Kualiti visual dan audio boleh diterima; dialog jelas didengar; potongan klip (editing cuts) dan pencahayaan asas berada pada tahap standard.'
        },
        4: {
          levelName: 'Baik',
          text: 'Rakaman stabil dengan pencahayaan yang terkawal; suntingan rentak (pacing) kemas; adunan audio antara vokal dan muzik latar sangat harmoni.'
        },
        5: {
          levelName: 'Cemerlang',
          text: 'Kualiti sinematik yang sangat teliti; color grading bersesuaian, pergerakan kamera lancar, transisi kemas, dan kualiti audio tahap profesional tanpa sebarang gangguan.'
        }
      }
    },
    {
      id: 'crit-4',
      name: 'Pengaruh Emosi',
      focus: 'Keupayaan karya membangkitkan perasaan penonton (bangga, terharu, semangat cinta akan negara, empati) serta keberkesanan impak penutup (call-to-action).',
      weight: 20,
      multiplier: 4,
      descriptors: {
        1: {
          levelName: 'Sangat Lemah',
          text: 'Video gagal menggerakkan sebarang perasaan; penyampaian kaku dan hambar.'
        },
        2: {
          levelName: 'Kurang Memuaskan',
          text: 'Emosi watak kelihatan dibuat-buat atau canggung; sukar menghubungkan rasa simpati/bangga dengan penonton.'
        },
        3: {
          levelName: 'Memuaskan',
          text: 'Berjaya menyampaikan perasaan positif secara bersahaja; penonton dapat merasakan sedikit rasa bangga atau keinsafan.'
        },
        4: {
          levelName: 'Baik',
          text: 'Lakonan dan pembawaan mesej mampu menyentuh perasaan penonton; ada resonans patriotisme yang kuat dan meyakinkan.'
        },
        5: {
          levelName: 'Cemerlang',
          text: 'Kuasa emosi yang amat luar biasa; berjaya membuat penonton terharu, meremang (goosebumps), atau sangat bersemangat patriotik; impak penamat kekal diingati lama selepas tontonan.'
        }
      }
    }
  ]
};

export const PRESET_RUBRICS: Record<string, RubricConfig> = {
  'lensa-patriot': DEFAULT_RUBRIC_CONFIG,
  'poster-infografik': {
    id: 'poster-infografik-2026',
    title: 'Pertandingan Poster Digital & Infografik Madani',
    subtitle: 'Rubrik Penilaian Visual & Mesej Patriotik',
    schoolName: 'SMK ST. THOMAS, KUCHING',
    motto: 'Aim Higher • Seni Berjiwa Kebangsaan',
    theme: 'Keharmonian dan Kemakmuran Masa Depan',
    targetDurationMinSec: [0, 0],
    categories: DEFAULT_RUBRIC_CONFIG.categories,
    gatekeepers: [
      {
        id: 'gk-p1',
        criterionText: 'Karya Asli & Bebas Plagiat',
        ruleNote: 'Bukan replika templat Canva langsung atau kecurian grafik',
        isMandatoryToPass: true,
        autoDisqualifyOnFail: true
      },
      {
        id: 'gk-p2',
        criterionText: 'Pematuhan Garis Panduan 3R',
        ruleNote: 'Bebas sebarang unsur provokasi kaum, agama & institusi diraja',
        isMandatoryToPass: true,
        autoDisqualifyOnFail: true
      },
      {
        id: 'gk-p3',
        criterionText: 'Dimensi & Resolusi Fail',
        ruleNote: 'Minimum A3 / 300 DPI, format PDF/PNG resolusi tinggi',
        isMandatoryToPass: true,
        autoDisqualifyOnFail: false
      }
    ],
    criteria: [
      {
        id: 'crit-p1',
        name: 'Kesesuaian Tema & Mesej',
        focus: 'Ketepatan penyampaian mesej perpaduan kebangsaan',
        weight: 35,
        multiplier: 7,
        descriptors: {
          1: { levelName: 'Sangat Lemah', text: 'Mesej tidak sampai atau menyimpang jauh dari tema.' },
          2: { levelName: 'Kurang Memuaskan', text: 'Mesej terhad dan tidak menyeluruh.' },
          3: { levelName: 'Memuaskan', text: 'Mesej jelas difahami penonton.' },
          4: { levelName: 'Baik', text: 'Penyampaian mesej berkesan dan bermakna.' },
          5: { levelName: 'Cemerlang', text: 'Mesej sangat menyentuh hati dan sarat inspirasi kebangsaan.' }
        }
      },
      {
        id: 'crit-p2',
        name: 'Kreativiti & Komposisi Visual',
        focus: 'Hierarki visual, tipografi, susun atur dan keaslian seni',
        weight: 35,
        multiplier: 7,
        descriptors: {
          1: { levelName: 'Sangat Lemah', text: 'Susun atur berselerak dan tidak kemas.' },
          2: { levelName: 'Kurang Memuaskan', text: 'Komposisi biasa dan klise.' },
          3: { levelName: 'Memuaskan', text: 'Komposisi seimbang dan mudah dibaca.' },
          4: { levelName: 'Baik', text: 'Komposisi menarik dan harmoni dalam susunan.' },
          5: { levelName: 'Cemerlang', text: 'Sentuhan reka bentuk luar biasa dan standard profesional.' }
        }
      },
      {
        id: 'crit-p3',
        name: 'Kualiti Teknikal & Pemilihan Warna',
        focus: 'Kekemasan ilustrasi, resolusi vektor/imej, palet warna berharmoni',
        weight: 30,
        multiplier: 6,
        descriptors: {
          1: { levelName: 'Sangat Lemah', text: 'Pecah piksel dan kontras warna kabur.' },
          2: { levelName: 'Kurang Memuaskan', text: 'Kualiti sederhana dengan kelemahan kontras.' },
          3: { levelName: 'Memuaskan', text: 'Kualiti grafik jelas dan kontras mencukupi.' },
          4: { levelName: 'Baik', text: 'Penggunaan palet warna harmoni dan resolusi tinggi.' },
          5: { levelName: 'Cemerlang', text: 'Kemasan teknikal amat teliti dan estetik cemerlang.' }
        }
      }
    ]
  },
  'pidato-madani': {
    id: 'pidato-madani-2026',
    title: 'Pertandingan Pengucapan Awam & Pidato Madani',
    subtitle: 'Borang Pemarkahan Juri Skala Likert',
    schoolName: 'SMK ST. THOMAS, KUCHING',
    motto: 'Aim Higher • Petah, Berhemah, Berwawasan',
    theme: 'Kesejahteraan Dinikmati, Kemakmuran Dirasai',
    targetDurationMinSec: [5, 7],
    categories: DEFAULT_RUBRIC_CONFIG.categories,
    gatekeepers: [
      {
        id: 'gk-sp1',
        criterionText: 'Pematuhan Masa (5-7 Minit)',
        ruleNote: 'Loceng akan dibunyikan pada minit ke-5 dan ke-7.',
        isMandatoryToPass: true,
        autoDisqualifyOnFail: false
      },
      {
        id: 'gk-sp2',
        criterionText: 'Adab Pertuturan & 3R',
        ruleNote: 'Tiada bahasa kesat atau provokasi kaum, agama dan raja.',
        isMandatoryToPass: true,
        autoDisqualifyOnFail: true
      }
    ],
    criteria: [
      {
        id: 'crit-s1',
        name: 'Kandungan & Hujah',
        focus: 'Kekuatan isi hujah berlandaskan fakta dan nilai Madani',
        weight: 40,
        multiplier: 8,
        descriptors: {
          1: { levelName: 'Sangat Lemah', text: 'Isi lemah tanpa bukti konkrit.' },
          2: { levelName: 'Kurang Memuaskan', text: 'Hujah longgar dan kurang meyakinkan.' },
          3: { levelName: 'Memuaskan', text: 'Isi mencukupi dengan contoh bersesuaian.' },
          4: { levelName: 'Baik', text: 'Hujah bernas dan susunan fakta tersusun rapi.' },
          5: { levelName: 'Cemerlang', text: 'Hujah sangat mantap, matang dan membuka minda audiens.' }
        }
      },
      {
        id: 'crit-s2',
        name: 'Gaya Penyampaian & Intonasi',
        focus: 'Kelancaran bahasa, kontak mata, intonasi suara dan bahasa badan',
        weight: 35,
        multiplier: 7,
        descriptors: {
          1: { levelName: 'Sangat Lemah', text: 'Kaku, membaca skrip sepenuhnya tanpa modulasi suara.' },
          2: { levelName: 'Kurang Memuaskan', text: 'Kurang yakin, intonasi mendatar.' },
          3: { levelName: 'Memuaskan', text: 'Lancar dan ada kontak mata dengan penonton.' },
          4: { levelName: 'Baik', text: 'Penyampaian bersemangat dan modulasi suara kemas.' },
          5: { levelName: 'Cemerlang', text: 'Karisma hebat, memukau audiens dan kawalan pentas sempurna.' }
        }
      },
      {
        id: 'crit-s3',
        name: 'Tatabahasa & Keindahan Bahasa',
        focus: 'Penggunaan bahasa baku, peribahasa dan frasa puitis bersesuaian',
        weight: 25,
        multiplier: 5,
        descriptors: {
          1: { levelName: 'Sangat Lemah', text: 'Banyak kesalahan tatabahasa dan kosa kata terhad.' },
          2: { levelName: 'Kurang Memuaskan', text: 'Bahasa agak hambar dan bersahaja.' },
          3: { levelName: 'Memuaskan', text: 'Penggunaan bahasa baku yang teratur.' },
          4: { levelName: 'Baik', text: 'Kosa kata luas dengan selingan pantun/peribahasa tepat.' },
          5: { levelName: 'Cemerlang', text: 'Bahasa amat indah, puitis dan berwibawa tinggi.' }
        }
      }
    ]
  }
};

export const DEFAULT_JUDGES: Judge[] = [
  {
    id: 'judge-1',
    name: 'Pn. Gwen',
    role: 'Guru Penyelaras Pertandingan',
    organization: 'Panitia Sejarah & Sivik, SMK St. Thomas',
    pin: '1111'
  },
  {
    id: 'judge-2',
    name: 'Cg. Ajien',
    role: 'Guru Penyelaras Bersama',
    organization: 'Kelab Multimedia & Fotografi, SMK St. Thomas',
    pin: '2222'
  },
  {
    id: 'judge-3',
    name: 'Dr. Wilson Intai',
    role: 'Ketua Panel Penilai / Juri Luar',
    organization: 'Kolej Seni & Komunikasi Kreatif',
    pin: '3333'
  }
];

export const INITIAL_ENTRIES: Entry[] = [
  {
    id: 'entry-a01',
    code: 'VID-A01',
    title: 'Gema Kesejahteraan: Rentak Borneo',
    category: 'Kategori A',
    leaderName: 'Brandon Ling Zhi Wei',
    teamMembers: ['Brandon Ling', 'Bryan Tan', 'Mohammad Danish', 'Arthur Wong'],
    actualDurationMin: 2,
    actualDurationSec: 42,
    submissionDate: '2026-09-02',
    videoUrl: 'https://youtu.be/example_st_thomas_01',
    notes: 'Kamera Sony A7III, rakaman di Waterfront Kuching & persekitaran sekolah.'
  },
  {
    id: 'entry-a02',
    code: 'VID-A02',
    title: 'Langkah Sepakat, Sejahtera Dinikmati',
    category: 'Kategori A',
    leaderName: 'Jessica Chong',
    teamMembers: ['Jessica Chong', 'Farhana binti Radzi', 'Alvin Ting'],
    actualDurationMin: 2,
    actualDurationSec: 55,
    submissionDate: '2026-09-03',
    notes: 'Rakaman wawancara bersama warga emas Kuching pelbagai kaum.'
  },
  {
    id: 'entry-b01',
    code: 'VID-B01',
    title: 'Pelangi Perpaduan St. Thomas',
    category: 'Kategori B',
    leaderName: 'Muhammad Harith Danial',
    teamMembers: ['Harith Danial', 'Lucas Kong', 'Ravi Shankar', 'Emmanuel Ding'],
    actualDurationMin: 2,
    actualDurationSec: 18,
    submissionDate: '2026-09-01',
    notes: 'Dokumentari mini kehidupan seharian murid di asrama dan bilik darjah.'
  },
  {
    id: 'entry-b02',
    code: 'VID-B02',
    title: 'Suara Jiwa: Demi Ibu Pertiwi',
    category: 'Kategori B',
    leaderName: 'Nicholas Chai',
    teamMembers: ['Nicholas Chai', 'Ahmad Zikri'],
    actualDurationMin: 1,
    actualDurationSec: 40, // 1m 40s -> Duration penalty (-5 marks applied!)
    submissionDate: '2026-09-03',
    notes: 'Durasi video 1 minit 40 saat (Kurang 1:45 minit - dikenakan penalti 5 markah).'
  },
  {
    id: 'entry-b03',
    code: 'VID-B03',
    title: 'Seiring Menggapai Impian',
    category: 'Kategori B',
    leaderName: 'Ryan Sim Yong',
    teamMembers: ['Ryan Sim', 'Jonathan Lee', 'Syed Nabil'],
    actualDurationMin: 2,
    actualDurationSec: 30,
    submissionDate: '2026-09-04',
    notes: 'Montaj sinematik drone dan lakonan pendek sukan sekolah.'
  },
  {
    id: 'entry-c01',
    code: 'VID-C01',
    title: 'Tunas Kasih Madani',
    category: 'Kategori C',
    leaderName: 'Isaac Kho',
    teamMembers: ['Isaac Kho', 'Daryl Lim', 'Khairul Anwar'],
    actualDurationMin: 2,
    actualDurationSec: 10,
    submissionDate: '2026-09-02',
    notes: 'Animasi stop-motion dan lakonan amatur yang kreatif.'
  },
  {
    id: 'entry-c02',
    code: 'VID-C02',
    title: 'Sahabat Sejati, Bangsa Madani',
    category: 'Kategori C',
    leaderName: 'Timothy Lau',
    teamMembers: ['Timothy Lau', 'Adam Daniel'],
    actualDurationMin: 2,
    actualDurationSec: 48,
    submissionDate: '2026-09-03',
    notes: 'Kisah tolong-menolong semasa membersihkan kantin sekolah.'
  }
];

// Helper to compute duration penalty based on the official guidelines:
// Target: 2:00 to 3:00 min (120s to 180s)
// Less than 1:45 (<105s) OR more than 3:15 (>195s) -> Tolak 5 Markah
// Less than 1:30 (<90s) OR more than 3:30 (>210s) -> Tolak 10 Markah
export function calculateDurationPenalty(min: number, sec: number): number {
  const totalSeconds = min * 60 + sec;
  if (totalSeconds <= 0) return 0;
  if (totalSeconds < 90 || totalSeconds > 210) {
    return 10;
  }
  if (totalSeconds < 105 || totalSeconds > 195) {
    return 5;
  }
  return 0;
}

// Helper to calculate total gross score from criteria scores & rubric
export function calculateGrossScore(
  scores: Record<string, number>,
  criteria: RubricConfig['criteria']
): number {
  let gross = 0;
  for (const crit of criteria) {
    const likert = scores[crit.id] || 0;
    gross += likert * crit.multiplier;
  }
  return Math.round(gross * 10) / 10;
}

// Initial realistic pre-filled scorecards for judges
export const INITIAL_SCORECARDS: Scorecard[] = [
  // VID-A01 scored by Pn. Gwen
  {
    id: 'sc-a01-j1',
    entryId: 'entry-a01',
    judgeId: 'judge-1',
    gatekeeperStatus: {
      'gk-1': true,
      'gk-2': true,
      'gk-3': true,
      'gk-4': true,
      'gk-5': true
    },
    criteriaScores: {
      'crit-1': 5, // 5 * 6 = 30
      'crit-2': 5, // 5 * 6 = 30
      'crit-3': 4, // 4 * 4 = 16
      'crit-4': 5  // 5 * 4 = 20 -> Gross 96
    },
    actualDurationMin: 2,
    actualDurationSec: 42,
    durationPenalty: 0,
    grossScore: 96,
    finalScore: 96,
    isDisqualified: false,
    qualitativeFeedback: {
      strengths: 'Konsep penceritaan rentak kepelbagaian kaum di Sarawak sangat menyentuh jiwa. Penggunaan muzik sape asli berpadu montaj sinematik moden.',
      improvements: 'Pencahayaan pada bahagian temubual dalam kelas boleh ditingkatkan agar tidak sedikit terdedah silau.'
    },
    isLocked: true,
    updatedAt: '2026-09-04 14:30'
  },
  // VID-A01 scored by Cg. Ajien
  {
    id: 'sc-a01-j2',
    entryId: 'entry-a01',
    judgeId: 'judge-2',
    gatekeeperStatus: {
      'gk-1': true,
      'gk-2': true,
      'gk-3': true,
      'gk-4': true,
      'gk-5': true
    },
    criteriaScores: {
      'crit-1': 5, // 30
      'crit-2': 4, // 24
      'crit-3': 5, // 20
      'crit-4': 4  // 16 -> Gross 90
    },
    actualDurationMin: 2,
    actualDurationSec: 42,
    durationPenalty: 0,
    grossScore: 90,
    finalScore: 90,
    isDisqualified: false,
    qualitativeFeedback: {
      strengths: 'Kualiti audio dan color grading amat profesional. Pacing suntingan tepat dengan denyut muzik latar.',
      improvements: 'Boleh tambahkan sari kata dwibahasa (BM & BI) pada bahagian dialog pendek.'
    },
    isLocked: true,
    updatedAt: '2026-09-04 15:10'
  },

  // VID-A02 scored by Pn. Gwen
  {
    id: 'sc-a02-j1',
    entryId: 'entry-a02',
    judgeId: 'judge-1',
    gatekeeperStatus: {
      'gk-1': true,
      'gk-2': true,
      'gk-3': true,
      'gk-4': true,
      'gk-5': true
    },
    criteriaScores: {
      'crit-1': 4, // 24
      'crit-2': 4, // 24
      'crit-3': 4, // 16
      'crit-4': 4  // 16 -> Gross 80
    },
    actualDurationMin: 2,
    actualDurationSec: 55,
    durationPenalty: 0,
    grossScore: 80,
    finalScore: 80,
    isDisqualified: false,
    qualitativeFeedback: {
      strengths: 'Mesej perpaduan generasi tua dan muda disampaikan secara jujur dan bersahaja.',
      improvements: 'Masa menghampiri had maksimum 3:00 minit, pastikan penutup tidak tergesa-gesa.'
    },
    isLocked: true,
    updatedAt: '2026-09-04 16:00'
  },

  // VID-B01 scored by Pn. Gwen
  {
    id: 'sc-b01-j1',
    entryId: 'entry-b01',
    judgeId: 'judge-1',
    gatekeeperStatus: {
      'gk-1': true,
      'gk-2': true,
      'gk-3': true,
      'gk-4': true,
      'gk-5': true
    },
    criteriaScores: {
      'crit-1': 5, // 30
      'crit-2': 4, // 24
      'crit-3': 4, // 16
      'crit-4': 5  // 20 -> Gross 90
    },
    actualDurationMin: 2,
    actualDurationSec: 18,
    durationPenalty: 0,
    grossScore: 90,
    finalScore: 90,
    isDisqualified: false,
    qualitativeFeedback: {
      strengths: 'Hubungan persahabatan antara pelajar pelbagai latar belakang di St. Thomas ditonjolkan dengan indah.',
      improvements: 'Gunakan tripod untuk beberapa rakaman berjalan agar visual lebih stabil.'
    },
    isLocked: true,
    updatedAt: '2026-09-04 14:45'
  },

  // VID-B02 scored by Pn. Gwen (with duration penalty of -5 marks!)
  {
    id: 'sc-b02-j1',
    entryId: 'entry-b02',
    judgeId: 'judge-1',
    gatekeeperStatus: {
      'gk-1': true,
      'gk-2': true,
      'gk-3': true,
      'gk-4': true,
      'gk-5': true
    },
    criteriaScores: {
      'crit-1': 4, // 24
      'crit-2': 3, // 18
      'crit-3': 3, // 12
      'crit-4': 4  // 16 -> Gross 70
    },
    actualDurationMin: 1,
    actualDurationSec: 40, // 100 sec -> penalty 5
    durationPenalty: 5,
    grossScore: 70,
    finalScore: 65, // 70 - 5 = 65
    isDisqualified: false,
    qualitativeFeedback: {
      strengths: 'Idea puisi patriotik berlatarbelakangkan tugu peringatan amat berkesan.',
      improvements: 'Durasi video hanya 1 minit 40 saat (di bawah syarat minimum 1:45 minit), markah ditolak 5 mata mengikut syarat poster.'
    },
    isLocked: true,
    updatedAt: '2026-09-04 15:30'
  },

  // VID-C01 scored by Pn. Gwen
  {
    id: 'sc-c01-j1',
    entryId: 'entry-c01',
    judgeId: 'judge-1',
    gatekeeperStatus: {
      'gk-1': true,
      'gk-2': true,
      'gk-3': true,
      'gk-4': true,
      'gk-5': true
    },
    criteriaScores: {
      'crit-1': 4, // 24
      'crit-2': 4, // 24
      'crit-3': 3, // 12
      'crit-4': 4  // 16 -> Gross 76
    },
    actualDurationMin: 2,
    actualDurationSec: 10,
    durationPenalty: 0,
    grossScore: 76,
    finalScore: 76,
    isDisqualified: false,
    qualitativeFeedback: {
      strengths: 'Kreativiti murid Tingkatan 1 menghasilkan animasi ringkas patut diberi pujian tinggi!',
      improvements: 'Rakaman audio vokal latar agak bergema di dalam bilik, gunakan mikrofon telefon yang lebih rapat.'
    },
    isLocked: true,
    updatedAt: '2026-09-04 16:40'
  }
];
