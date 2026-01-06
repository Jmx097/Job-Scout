/**
 * Scoring weights for job matching algorithm
 */
export interface ScoringWeights {
  skillMatch: number;      // 0.35 - Primary driver
  experienceLevel: number; // 0.20 - Years match
  locationMatch: number;   // 0.15 - Remote/local preference
  salaryFit: number;       // 0.15 - Within range
  companySignals: number;  // 0.10 - Company reputation
  recency: number;         // 0.05 - How recent the posting
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  skillMatch: 0.35,
  experienceLevel: 0.20,
  locationMatch: 0.15,
  salaryFit: 0.15,
  companySignals: 0.10,
  recency: 0.05,
};

export type Tier = 'A' | 'B' | 'C' | 'D';

export interface ScoringBreakdown {
  skillMatch: number;
  experienceLevel: number;
  locationMatch: number;
  salaryFit: number;
  companySignals: number;
  recency: number;
  total: number;
  tier: Tier;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
}

/**
 * Calculate tier based on total score
 */
export function calculateTier(score: number): Tier {
  if (score >= 0.85) return 'A';
  if (score >= 0.70) return 'B';
  if (score >= 0.50) return 'C';
  return 'D';
}

/**
 * Calculate weighted total score from breakdown
 */
export function calculateTotalScore(
  breakdown: Omit<ScoringBreakdown, 'total' | 'tier' | 'matchedSkills' | 'missingSkills' | 'explanation'>,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  return (
    breakdown.skillMatch * weights.skillMatch +
    breakdown.experienceLevel * weights.experienceLevel +
    breakdown.locationMatch * weights.locationMatch +
    breakdown.salaryFit * weights.salaryFit +
    breakdown.companySignals * weights.companySignals +
    breakdown.recency * weights.recency
  );
}

/**
 * Get tier display info
 */
export function getTierInfo(tier: Tier): { label: string; color: string; description: string } {
  const tiers = {
    A: { label: 'Excellent Match', color: 'tier-a', description: 'Strong fit - apply immediately' },
    B: { label: 'Good Match', color: 'tier-b', description: 'Worth applying - solid opportunity' },
    C: { label: 'Fair Match', color: 'tier-c', description: 'Consider applying - some gaps' },
    D: { label: 'Low Match', color: 'tier-d', description: 'Not recommended - significant gaps' },
  };
  return tiers[tier];
}
