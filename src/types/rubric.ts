export type CategoryId = 'Kategori A' | 'Kategori B' | 'Kategori C' | string;
export type AppRole = 'peserta' | 'hakim' | 'penganjur';

export interface LikertDescriptor {
  level: number;
  levelName: string;
  description: string;
}

export interface Criterion {
  id: string;
  name: string;
  focus: string;
  weight: number; // percentage, e.g. 30
  multiplier: number; // weight / 5
  descriptors: {
    [level: number]: {
      levelName: string;
      text: string;
    };
  };
}

export interface GatekeeperItem {
  id: string;
  criterionText: string;
  ruleNote: string;
  isMandatoryToPass: boolean; // if false, might just trigger warning
  autoDisqualifyOnFail: boolean;
}

export interface DurationPenaltyRule {
  id: string;
  conditionLabel: string;
  penaltyMarks: number;
  // validator function based on total seconds
  appliesTo: (totalSec: number) => boolean;
}

export interface RubricConfig {
  id: string;
  title: string;
  subtitle: string;
  schoolName: string;
  motto: string;
  theme: string;
  targetDurationMinSec: [number, number]; // e.g. [2, 3] minutes
  criteria: Criterion[];
  gatekeepers: GatekeeperItem[];
  categories: { id: string; name: string; description: string; prizeFirst?: string; prizeSecond?: string; prizeThird?: string }[];
}

export interface Entry {
  id: string;
  code: string;
  title: string;
  category: CategoryId;
  teamMembers: string[];
  leaderName: string;
  actualDurationMin: number;
  actualDurationSec: number;
  videoUrl?: string;
  submissionDate: string;
  notes?: string;
}

export interface Judge {
  id: string;
  name: string;
  role: string;
  organization?: string;
  pin?: string; // 4-digit security PIN for identity verification
}

export interface Scorecard {
  id: string;
  entryId: string;
  judgeId: string;
  gatekeeperStatus: Record<string, boolean>; // gatekeeperId -> passed
  criteriaScores: Record<string, number>; // criterionId -> Likert 1-5
  actualDurationMin: number;
  actualDurationSec: number;
  durationPenalty: number;
  grossScore: number;
  finalScore: number;
  isDisqualified: boolean;
  disqualificationReason?: string;
  qualitativeFeedback: {
    strengths: string;
    improvements: string;
  };
  isLocked: boolean;
  updatedAt: string;
}

export interface ConsolidatedLeaderboardRow {
  entry: Entry;
  category: CategoryId;
  judgeCount: number;
  avgGrossScore: number;
  avgPenalty: number;
  avgFinalScore: number;
  criteriaAverages: Record<string, number>;
  isDisqualified: boolean;
  disqualificationReason?: string;
  rank: number;
  prize?: string;
  scorecards: Scorecard[];
}

export interface ScorecardDraft {
  entryId: string;
  judgeId: string;
  gatekeeperStatus: Record<string, boolean>;
  criteriaScores: Record<string, number>;
  durationMin: number;
  durationSec: number;
  strengths: string;
  improvements: string;
  isDisqualified?: boolean;
  disqualificationReason?: string;
  savedAt: string;
}
