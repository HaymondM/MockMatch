import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '@/lib/session-manager';
import {
  ParsedJobDescription,
  InterviewQuestion,
  AnswerFeedback,
  SessionFeedback,
} from '@/types';

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let mockParsedJD: ParsedJobDescription;
  let mockQuestions: InterviewQuestion[];

  beforeEach(() => {
    sessionManager = new SessionManager();

    mockParsedJD = {
      roleType: 'software',
      skills: ['JavaScript', 'React', 'Node.js'],
      experienceLevel: 'mid',
      technologies: ['TypeScript', 'Next.js'],
      responsibilities: ['Build web applications', 'Write tests'],
      rawDescription: 'A software engineer position requiring JavaScript and React experience.',
    };

    mockQuestions = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'technical',
        question: 'Explain closures in JavaScript',
        difficulty: 'mid',
        relatedSkills: ['JavaScript'],
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        type: 'behavioral',
        question: 'Describe a challenging project',
        difficulty: 'mid',
        relatedSkills: ['React'],
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        type: 'system-design',
        question: 'Design a URL shortener',
        difficulty: 'mid',
        relatedSkills: ['Node.js'],
      },
    ];
  });

  describe('createSession', () => {
    it('should create a new session with correct initial state', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);

      expect(session.id).toBeDefined();
      expect(session.parsedJD).toEqual(mockParsedJD);
      expect(session.questions).toEqual(mockQuestions);
      expect(session.answers.size).toBe(0);
      expect(session.feedback.size).toBe(0);
      expect(session.sessionFeedback).toBeNull();
      expect(session.currentQuestionIndex).toBe(0);
      expect(session.isComplete).toBe(false);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.completedAt).toBeNull();
    });

    it('should generate unique IDs for different sessions', () => {
      const session1 = sessionManager.createSession(mockParsedJD, mockQuestions);
      const session2 = sessionManager.createSession(mockParsedJD, mockQuestions);

      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('storeAnswer and getAnswer', () => {
    it('should store and retrieve an answer', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);
      const questionId = mockQuestions[0].id;
      const answer = 'Closures are functions that have access to outer scope';

      const updatedSession = sessionManager.storeAnswer(session, questionId, answer);
      const retrievedAnswer = sessionManager.getAnswer(updatedSession, questionId);

      expect(retrievedAnswer).toBe(answer);
    });

    it('should throw error for non-existent question ID', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);
      const invalidId = '550e8400-e29b-41d4-a716-446655440999';

      expect(() => {
        sessionManager.storeAnswer(session, invalidId, 'Some answer');
      }).toThrow('Question with ID');
    });

    it('should return undefined for question without answer', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);
      const questionId = mockQuestions[0].id;

      const answer = sessionManager.getAnswer(session, questionId);

      expect(answer).toBeUndefined();
    });
  });

  describe('storeFeedback and getFeedback', () => {
    it('should store and retrieve feedback', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);
      const feedback: AnswerFeedback = {
        questionId: mockQuestions[0].id,
        score: 8,
        strengths: ['Good explanation', 'Clear examples'],
        improvements: ['Could add more detail', 'Mention use cases'],
        timestamp: new Date(),
      };

      const updatedSession = sessionManager.storeFeedback(session, feedback);
      const retrievedFeedback = sessionManager.getFeedback(
        updatedSession,
        mockQuestions[0].id
      );

      expect(retrievedFeedback).toEqual(feedback);
    });
  });

  describe('setCurrentQuestionIndex', () => {
    it('should update the current question index', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);

      const updatedSession = sessionManager.setCurrentQuestionIndex(session, 1);

      expect(updatedSession.currentQuestionIndex).toBe(1);
    });

    it('should throw error for invalid index', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);

      expect(() => {
        sessionManager.setCurrentQuestionIndex(session, -1);
      }).toThrow('Invalid question index');

      expect(() => {
        sessionManager.setCurrentQuestionIndex(session, 10);
      }).toThrow('Invalid question index');
    });
  });

  describe('completeSession', () => {
    it('should mark session as complete', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);

      const completedSession = sessionManager.completeSession(session);

      expect(completedSession.isComplete).toBe(true);
      expect(completedSession.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('areAllQuestionsAnswered', () => {
    it('should return false when not all questions are answered', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);

      expect(sessionManager.areAllQuestionsAnswered(session)).toBe(false);
    });

    it('should return true when all questions are answered', () => {
      let session = sessionManager.createSession(mockParsedJD, mockQuestions);

      // Answer all questions
      mockQuestions.forEach((q) => {
        session = sessionManager.storeAnswer(session, q.id, 'Some answer');
      });

      expect(sessionManager.areAllQuestionsAnswered(session)).toBe(true);
    });
  });

  describe('navigation methods', () => {
    it('should navigate to next question', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);

      const nextSession = sessionManager.nextQuestion(session);

      expect(nextSession.currentQuestionIndex).toBe(1);
    });

    it('should navigate to previous question', () => {
      let session = sessionManager.createSession(mockParsedJD, mockQuestions);
      session = sessionManager.setCurrentQuestionIndex(session, 1);

      const prevSession = sessionManager.previousQuestion(session);

      expect(prevSession.currentQuestionIndex).toBe(0);
    });

    it('should throw error when navigating beyond bounds', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);

      expect(() => {
        sessionManager.previousQuestion(session);
      }).toThrow('Already at the first question');

      let lastSession = sessionManager.setCurrentQuestionIndex(
        session,
        mockQuestions.length - 1
      );

      expect(() => {
        sessionManager.nextQuestion(lastSession);
      }).toThrow('Already at the last question');
    });
  });

  describe('getCurrentQuestion', () => {
    it('should return the current question', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);

      const currentQuestion = sessionManager.getCurrentQuestion(session);

      expect(currentQuestion).toEqual(mockQuestions[0]);
    });
  });

  describe('storeSessionFeedback', () => {
    it('should store session feedback', () => {
      const session = sessionManager.createSession(mockParsedJD, mockQuestions);
      const sessionFeedback: SessionFeedback = {
        overallScore: 7.5,
        performanceSummary: {
          behavioral: 8,
          technical: 7,
          systemDesign: 7.5,
        },
        strongestAreas: ['Communication', 'Problem solving'],
        improvementAreas: ['System design depth', 'Code optimization'],
        recommendations: ['Practice more system design', 'Study algorithms'],
      };

      const updatedSession = sessionManager.storeSessionFeedback(
        session,
        sessionFeedback
      );

      expect(updatedSession.sessionFeedback).toEqual(sessionFeedback);
    });
  });
});
