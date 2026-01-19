// Core Types for Prompt Hub

// ==================== User Types ====================
export interface User {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserSession = Pick<User, 'id' | 'email' | 'username'>;

// ==================== Prompt Types ====================
export type PromptStatus = 'draft' | 'published' | 'published_with_updates';

export interface Prompt {
  id: string;
  userId: string;
  title: string;
  currentVersionId: string | null;
  draftContent: string | null;
  status: PromptStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptWithTags extends Prompt {
  tags: Tag[];
  currentVersion: PromptVersion | null;
}

export interface PromptListItem {
  id: string;
  title: string;
  status: PromptStatus;
  tags: Tag[];
  currentVersion: {
    versionNumber: number;
    publishedAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Version Types ====================
export interface PromptVersion {
  id: string;
  promptId: string;
  versionNumber: number;
  content: string;
  description: string | null;
  changelog: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

// ==================== Tag Types ====================
export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
}

// ==================== AI Types ====================
export interface DiagnoseResult {
  overallScore: number;
  scores: {
    clarity: ScoreDetail;
    completeness: ScoreDetail;
    effectiveness: ScoreDetail;
    structure: ScoreDetail;
  };
  suggestions: string[];
}

export interface ScoreDetail {
  score: number;
  feedback: string;
}
