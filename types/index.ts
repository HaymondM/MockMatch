import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export type RoleType = 'software' | 'devops' | 'security';
export type QuestionType = 'behavioral' | 'technical' | 'system-design';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'staff';

// ============================================================================
// Core Interfaces
// ============================================================================

export interface ParsedJobDescription {
  roleType: RoleType;
  skills: string[];
  experienceLevel: ExperienceLevel;
  technologies: string[];
  responsibilities: string[];
  rawDescription: string;
}

export interface InterviewQuestion {
  id: string;
  type: QuestionType;
  question: string;
  difficulty: ExperienceLevel;
  relatedSkills: string[];
}

export interface AnswerFeedback {
  questionId: string;
  score: number; // 1-10
  strengths: string[]; // minimum 2
  improvements: string[]; // minimum 2
  timestamp: Date;
}

export interface SessionFeedback {
  overallScore: number;
  performanceSummary: {
    behavioral: number;
    technical: number;
    systemDesign: number;
  };
  strongestAreas: string[];
  improvementAreas: string[];
  recommendations: string[];
}

export interface InterviewSession {
  id: string;
  parsedJD: ParsedJobDescription;
  questions: InterviewQuestion[];
  answers: Map<string, string>; // questionId -> answer
  feedback: Map<string, AnswerFeedback>; // questionId -> feedback
  sessionFeedback: SessionFeedback | null;
  currentQuestionIndex: number;
  isComplete: boolean;
  createdAt: Date;
  completedAt: Date | null;
}

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

export const RoleTypeSchema = z.enum(['software', 'devops', 'security']);

export const QuestionTypeSchema = z.enum([
  'behavioral',
  'technical',
  'system-design',
]);

export const ExperienceLevelSchema = z.enum([
  'junior',
  'mid',
  'senior',
  'staff',
]);

export const ParsedJobDescriptionSchema = z.object({
  roleType: RoleTypeSchema,
  skills: z.array(z.string()).min(1),
  experienceLevel: ExperienceLevelSchema,
  technologies: z.array(z.string()),
  responsibilities: z.array(z.string()),
  rawDescription: z.string().min(50),
});

export const InterviewQuestionSchema = z.object({
  id: z.string().uuid(),
  type: QuestionTypeSchema,
  question: z.string().min(10),
  difficulty: ExperienceLevelSchema,
  relatedSkills: z.array(z.string()),
});

export const AnswerFeedbackSchema = z.object({
  questionId: z.string().uuid(),
  score: z.number().min(1).max(10),
  strengths: z.array(z.string()).min(2),
  improvements: z.array(z.string()).min(2),
  timestamp: z.date(),
});

export const SessionFeedbackSchema = z.object({
  overallScore: z.number().min(1).max(10),
  performanceSummary: z.object({
    behavioral: z.number().min(0).max(10),
    technical: z.number().min(0).max(10),
    systemDesign: z.number().min(0).max(10),
  }),
  strongestAreas: z.array(z.string()).min(1),
  improvementAreas: z.array(z.string()).min(1),
  recommendations: z.array(z.string()).min(1),
});

// Note: InterviewSession schema is complex due to Map types
// Serialization/deserialization will handle Map conversion
export const InterviewSessionSchema = z.object({
  id: z.string().uuid(),
  parsedJD: ParsedJobDescriptionSchema,
  questions: z.array(InterviewQuestionSchema).min(5),
  answers: z.record(z.string(), z.string()),
  feedback: z.record(z.string(), AnswerFeedbackSchema),
  sessionFeedback: SessionFeedbackSchema.nullable(),
  currentQuestionIndex: z.number().min(0),
  isComplete: z.boolean(),
  createdAt: z.date(),
  completedAt: z.date().nullable(),
});
