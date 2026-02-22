import {
  InterviewSession,
  ParsedJobDescription,
  InterviewQuestion,
  AnswerFeedback,
  SessionFeedback,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Session Manager - Handles interview session state management
 * Requirements: 3.1, 3.3, 3.4, 3.5, 6.1, 6.2
 */
export class SessionManager {
  /**
   * Creates a new interview session
   * Requirement 3.1: Create a new Interview_Session when candidate starts
   */
  createSession(
    parsedJD: ParsedJobDescription,
    questions: InterviewQuestion[]
  ): InterviewSession {
    return {
      id: uuidv4(),
      parsedJD,
      questions,
      answers: new Map<string, string>(),
      feedback: new Map<string, AnswerFeedback>(),
      sessionFeedback: null,
      currentQuestionIndex: 0,
      isComplete: false,
      createdAt: new Date(),
      completedAt: null,
    };
  }

  /**
   * Stores an answer for a specific question
   * Requirement 3.3: Store answer with associated question identifier
   */
  storeAnswer(
    session: InterviewSession,
    questionId: string,
    answer: string
  ): InterviewSession {
    // Validate that the question exists
    const questionExists = session.questions.some((q) => q.id === questionId);
    if (!questionExists) {
      throw new Error(`Question with ID ${questionId} not found in session`);
    }

    // Create a new Map with the updated answer
    const updatedAnswers = new Map(session.answers);
    updatedAnswers.set(questionId, answer);

    return {
      ...session,
      answers: updatedAnswers,
    };
  }

  /**
   * Retrieves an answer for a specific question
   * Requirement 3.3: Answer storage and retrieval
   */
  getAnswer(session: InterviewSession, questionId: string): string | undefined {
    return session.answers.get(questionId);
  }

  /**
   * Stores feedback for a specific question
   * Requirement 6.2: Store feedback within the session
   */
  storeFeedback(
    session: InterviewSession,
    feedback: AnswerFeedback
  ): InterviewSession {
    const updatedFeedback = new Map(session.feedback);
    updatedFeedback.set(feedback.questionId, feedback);

    return {
      ...session,
      feedback: updatedFeedback,
    };
  }

  /**
   * Retrieves feedback for a specific question
   */
  getFeedback(
    session: InterviewSession,
    questionId: string
  ): AnswerFeedback | undefined {
    return session.feedback.get(questionId);
  }

  /**
   * Updates the current question index
   * Requirement 3.6: Navigate between questions
   */
  setCurrentQuestionIndex(
    session: InterviewSession,
    index: number
  ): InterviewSession {
    if (index < 0 || index >= session.questions.length) {
      throw new Error(
        `Invalid question index: ${index}. Must be between 0 and ${session.questions.length - 1}`
      );
    }

    return {
      ...session,
      currentQuestionIndex: index,
    };
  }

  /**
   * Marks the session as complete
   * Requirement 3.5: Mark session as complete when all questions are answered
   */
  completeSession(session: InterviewSession): InterviewSession {
    return {
      ...session,
      isComplete: true,
      completedAt: new Date(),
    };
  }

  /**
   * Checks if all questions have been answered
   * Requirement 3.5: Session completion logic
   */
  areAllQuestionsAnswered(session: InterviewSession): boolean {
    return session.answers.size === session.questions.length;
  }

  /**
   * Stores session feedback
   * Requirement 6.2: Store feedback within the session
   */
  storeSessionFeedback(
    session: InterviewSession,
    sessionFeedback: SessionFeedback
  ): InterviewSession {
    return {
      ...session,
      sessionFeedback,
    };
  }

  /**
   * Gets the current question
   */
  getCurrentQuestion(session: InterviewSession): InterviewQuestion {
    return session.questions[session.currentQuestionIndex];
  }

  /**
   * Navigates to the next question
   */
  nextQuestion(session: InterviewSession): InterviewSession {
    const nextIndex = session.currentQuestionIndex + 1;
    if (nextIndex >= session.questions.length) {
      throw new Error('Already at the last question');
    }
    return this.setCurrentQuestionIndex(session, nextIndex);
  }

  /**
   * Navigates to the previous question
   */
  previousQuestion(session: InterviewSession): InterviewSession {
    const prevIndex = session.currentQuestionIndex - 1;
    if (prevIndex < 0) {
      throw new Error('Already at the first question');
    }
    return this.setCurrentQuestionIndex(session, prevIndex);
  }
}

// Export a singleton instance
export const sessionManager = new SessionManager();
