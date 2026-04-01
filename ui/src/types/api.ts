// src/types/api.ts

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Outcome    = 'OFFER' | 'REJECTED' | 'GHOSTED' | 'PENDING';
export type QuestionCategory =
  | 'DSA' | 'SYSTEM_DESIGN' | 'LLD' | 'BEHAVIORAL'
  | 'DATABASE' | 'OS_NETWORKING' | 'LANGUAGE_SPECIFIC';

export interface CompanySummary {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  industry?: string;
  experienceCount?: number;
}

export interface CompanyDetail extends CompanySummary {
  website?: string;
  totalExperiences: number;
  availableRoles: string[];
}

export interface Question {
  id: number;
  text: string;
  category: QuestionCategory;
  topic?: string;
  roundNumber?: number;
}

export interface Experience {
  id: number;
  company: CompanySummary;
  role: string;
  level?: string;
  year: number;
  month?: number;
  difficulty: Difficulty;
  outcome?: Outcome;
  rounds?: number;
  description?: string;
  verifiedEmail: string;
  upvotes: number;
  createdAt: string;
  questions: Question[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
}

export interface TopicHint {
  topic: string;
  frequency: number;
}

export interface CategoryPrediction {
  category: QuestionCategory;
  probability: number;
  observedCount: number;
  topTopics: TopicHint[];
}

export interface PredictionResponse {
  companyName: string;
  role: string;
  dataPointsUsed: number;
  categoryPredictions: CategoryPrediction[];
  insight: string;
}

export interface CreateExperiencePayload {
  companySlug: string;
  role: string;
  level?: string;
  year: number;
  month?: number;
  difficulty: Difficulty;
  outcome?: Outcome;
  rounds?: number;
  description?: string;
  questions: {
    text: string;
    category?: QuestionCategory;
    topic?: string;
    roundNumber?: number;
  }[];
}
