import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  serializeSession,
  deserializeSession,
  STORAGE_KEYS,
} from '@/lib/storage';
import { InterviewSession, AnswerFeedback } from '@/types';

describe('Storage Serialization', () => {
  let mockSession: InterviewSession;

  beforeEach(() => {
    mockSession = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      parsedJD: {
        roleType: 'software',
        skills: ['JavaScript', 'React'],
        experienceLevel: 'mid',
        technologies: ['TypeScript', 'Next.js'],
        responsibilities: ['Build web apps'],
        rawDescription: 'A software engineer position requiring JavaScript experience.',
      },
      questions: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          type: 'technical',
          question: 'Explain closures',
          difficulty: 'mid',
          relatedSkills: ['JavaScript'],
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          type: 'behavioral',
          question: 'Describe a project',
          difficulty: 'mid',
          relatedSkills: ['React'],
        },
      ],
      answers: new Map([
        ['550e8400-e29b-41d4-a716-446655440001', 'Closures are functions...'],
        ['550e8400-e29b-41d4-a716-446655440002', 'I worked on a project...'],
      ]),
      feedback: new Map([
        [
          '550e8400-e29b-41d4-a716-446655440001',
          {
            questionId: '550e8400-e29b-41d4-a716-446655440001',
            score: 8,
            strengths: ['Good explanation', 'Clear examples'],
            improvements: ['Add more detail', 'Mention use cases'],
            timestamp: new Date('2026-01-15T10:00:00Z'),
          },
        ],
      ]),
      sessionFeedback: {
        overallScore: 7.5,
        performanceSummary: {
          behavioral: 8,
          technical: 7,
          systemDesign: 7.5,
        },
        strongestAreas: ['Communication'],
        improvementAreas: ['System design'],
        recommendations: ['Practice more'],
      },
      currentQuestionIndex: 1,
      isComplete: false,
      createdAt: new Date('2026-01-15T09:00:00Z'),
      completedAt: null,
    };
  });

  describe('serializeSession', () => {
    it('should serialize a session to JSON string', () => {
      const serialized = serializeSession(mockSession);

      expect(typeof serialized).toBe('string');
      expect(() => JSON.parse(serialized)).not.toThrow();
    });

    it('should serialize Maps as arrays', () => {
      const serialized = serializeSession(mockSession);
      const parsed = JSON.parse(serialized);

      expect(Array.isArray(parsed.answers)).toBe(true);
      expect(Array.isArray(parsed.feedback)).toBe(true);
    });

    it('should serialize Dates as ISO strings', () => {
      const serialized = serializeSession(mockSession);
      const parsed = JSON.parse(serialized);

      expect(typeof parsed.createdAt).toBe('string');
      expect(parsed.createdAt).toBe('2026-01-15T09:00:00.000Z');
      expect(parsed.completedAt).toBeNull();
    });

    it('should serialize feedback timestamps as ISO strings', () => {
      const serialized = serializeSession(mockSession);
      const parsed = JSON.parse(serialized);

      const feedbackEntry = parsed.feedback[0][1];
      expect(typeof feedbackEntry.timestamp).toBe('string');
      expect(feedbackEntry.timestamp).toBe('2026-01-15T10:00:00.000Z');
    });
  });

  describe('deserializeSession', () => {
    it('should deserialize a JSON string back to InterviewSession', () => {
      const serialized = serializeSession(mockSession);
      const deserialized = deserializeSession(serialized);

      expect(deserialized.id).toBe(mockSession.id);
      expect(deserialized.parsedJD).toEqual(mockSession.parsedJD);
      expect(deserialized.questions).toEqual(mockSession.questions);
      expect(deserialized.currentQuestionIndex).toBe(mockSession.currentQuestionIndex);
      expect(deserialized.isComplete).toBe(mockSession.isComplete);
    });

    it('should reconstruct Maps from arrays', () => {
      const serialized = serializeSession(mockSession);
      const deserialized = deserializeSession(serialized);

      expect(deserialized.answers).toBeInstanceOf(Map);
      expect(deserialized.feedback).toBeInstanceOf(Map);
      expect(deserialized.answers.size).toBe(2);
      expect(deserialized.feedback.size).toBe(1);
    });

    it('should reconstruct Dates from ISO strings', () => {
      const serialized = serializeSession(mockSession);
      const deserialized = deserializeSession(serialized);

      expect(deserialized.createdAt).toBeInstanceOf(Date);
      expect(deserialized.createdAt.toISOString()).toBe('2026-01-15T09:00:00.000Z');
      expect(deserialized.completedAt).toBeNull();
    });

    it('should reconstruct feedback timestamps', () => {
      const serialized = serializeSession(mockSession);
      const deserialized = deserializeSession(serialized);

      const feedback = deserialized.feedback.get('550e8400-e29b-41d4-a716-446655440001');
      expect(feedback).toBeDefined();
      expect(feedback!.timestamp).toBeInstanceOf(Date);
      expect(feedback!.timestamp.toISOString()).toBe('2026-01-15T10:00:00.000Z');
    });

    it('should handle completed sessions with completedAt date', () => {
      const completedSession = {
        ...mockSession,
        isComplete: true,
        completedAt: new Date('2026-01-15T11:00:00Z'),
      };

      const serialized = serializeSession(completedSession);
      const deserialized = deserializeSession(serialized);

      expect(deserialized.isComplete).toBe(true);
      expect(deserialized.completedAt).toBeInstanceOf(Date);
      expect(deserialized.completedAt!.toISOString()).toBe('2026-01-15T11:00:00.000Z');
    });

    it('should throw error for invalid JSON', () => {
      expect(() => {
        deserializeSession('invalid json');
      }).toThrow('Failed to deserialize session: Invalid JSON format');
    });

    it('should throw error for missing required fields', () => {
      const invalidData = JSON.stringify({ id: '123' });

      expect(() => {
        deserializeSession(invalidData);
      }).toThrow('Failed to deserialize session: Invalid session data');
    });

    it('should throw error for invalid date strings', () => {
      const invalidData = JSON.stringify({
        id: '123',
        parsedJD: mockSession.parsedJD,
        questions: mockSession.questions,
        answers: [],
        feedback: [],
        sessionFeedback: null,
        currentQuestionIndex: 0,
        isComplete: false,
        createdAt: 'invalid-date',
        completedAt: null,
      });

      expect(() => {
        deserializeSession(invalidData);
      }).toThrow('Failed to deserialize session: Invalid session data: createdAt is not a valid date');
    });
  });

  describe('round-trip serialization', () => {
    it('should preserve all data through serialize-deserialize cycle', () => {
      const serialized = serializeSession(mockSession);
      const deserialized = deserializeSession(serialized);

      // Check all fields
      expect(deserialized.id).toBe(mockSession.id);
      expect(deserialized.parsedJD).toEqual(mockSession.parsedJD);
      expect(deserialized.questions).toEqual(mockSession.questions);
      expect(deserialized.sessionFeedback).toEqual(mockSession.sessionFeedback);
      expect(deserialized.currentQuestionIndex).toBe(mockSession.currentQuestionIndex);
      expect(deserialized.isComplete).toBe(mockSession.isComplete);

      // Check Maps
      expect(deserialized.answers.get('550e8400-e29b-41d4-a716-446655440001')).toBe(
        mockSession.answers.get('550e8400-e29b-41d4-a716-446655440001')
      );

      // Check Dates
      expect(deserialized.createdAt.getTime()).toBe(mockSession.createdAt.getTime());

      // Check nested feedback
      const originalFeedback = mockSession.feedback.get(
        '550e8400-e29b-41d4-a716-446655440001'
      );
      const deserializedFeedback = deserialized.feedback.get(
        '550e8400-e29b-41d4-a716-446655440001'
      );
      expect(deserializedFeedback?.score).toBe(originalFeedback?.score);
      expect(deserializedFeedback?.strengths).toEqual(originalFeedback?.strengths);
      expect(deserializedFeedback?.timestamp.getTime()).toBe(
        originalFeedback?.timestamp.getTime()
      );
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have correct storage key constants', () => {
      expect(STORAGE_KEYS.CURRENT_SESSION).toBe('mockmatch:current-session');
      expect(STORAGE_KEYS.SESSION_HISTORY).toBe('mockmatch:session-history');
    });

    it('should generate correct session-specific keys', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      expect(STORAGE_KEYS.session(sessionId)).toBe(
        `mockmatch:session:${sessionId}`
      );
    });
  });
});
