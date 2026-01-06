import { Tier, ScoringBreakdown } from './scoring';

// ============================================
// User & Profile Types
// ============================================

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Profile {
  id: number;
  userId: string;
  name: string;
  resumeData: ResumeData | null;
  searchConfig: SearchConfig;
  scheduleInterval: ScheduleInterval;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications: string[];
  languages: string[];
}

export interface WorkExperience {
  title: string;
  company: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  gpa: string | null;
}

// ============================================
// Job Types
// ============================================

export interface Job {
  id: number;
  userId: string;
  profileId: number | null;
  externalId: string | null;
  title: string;
  company: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string | null;
  url: string | null;
  source: JobSource;
  score: number | null;
  tier: Tier | null;
  matchedSkills: string[];
  scoringBreakdown: ScoringBreakdown | null;
  status: JobStatus;
  createdAt: string;
}

export type JobSource = 'indeed' | 'linkedin' | 'glassdoor' | 'ziprecruiter' | 'google' | 'other';
export type JobStatus = 'new' | 'applied' | 'saved' | 'hidden';
export type ScheduleInterval = 'manual' | '1h' | '3h' | '6h' | '12h' | '24h';

// ============================================
// Search Configuration
// ============================================

export interface SearchConfig {
  sources: JobSource[];
  searchTerms: string[];
  locations: string[];
  remoteOnly: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  excludeKeywords: string[];
  excludeSenior: boolean;
  excludeInternational: boolean;
}

export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  sources: ['indeed', 'linkedin', 'glassdoor'],
  searchTerms: [],
  locations: [],
  remoteOnly: false,
  salaryMin: null,
  salaryMax: null,
  excludeKeywords: [],
  excludeSenior: false,
  excludeInternational: false,
};

// ============================================
// Settings
// ============================================

export interface UserSettings {
  userId: string;
  autoPurgeDays: number;
  privacyMode: boolean;
  exportFormat: 'json' | 'csv';
}

// ============================================
// Metrics & Stats
// ============================================

export interface DashboardStats {
  totalJobs: number;
  appliedCount: number;
  savedCount: number;
  hiddenCount: number;
  averageScore: number;
  interviewLikelihood: number;
  tierDistribution: Record<Tier, number>;
}

export interface SearchRun {
  id: number;
  userId: string;
  profileId: number;
  startedAt: string;
  completedAt: string | null;
  status: 'running' | 'completed' | 'failed';
  jobsFound: number;
  jobsScored: number;
  errorMessage: string | null;
  apiTokensUsed: number;
}

export interface SystemHealth {
  lastSearchRun: SearchRun | null;
  nextScheduledRun: string | null;
  apiKeyActive: boolean;
  estimatedApiUsage: number;
  dataFreshnessDays: number;
}

// ============================================
// API Contracts
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface JobsQueryParams {
  page?: number;
  pageSize?: number;
  status?: JobStatus;
  source?: JobSource;
  tier?: Tier;
  minScore?: number;
  sortBy?: 'score' | 'createdAt' | 'salary';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
