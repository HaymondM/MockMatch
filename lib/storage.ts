import { InterviewSession, AnswerFeedback } from '@/types';

/**
 * Storage keys for local storage
 * Requirements: 10.1, 10.2, 10.4, 6.1, 6.2
 */
export const STORAGE_KEYS = {
  CURRENT_SESSION: 'mockmatch:current-session',
  SESSION_HISTORY: 'mockmatch:session-history',
  session: (id: string) => `mockmatch:session:${id}`,
} as const;

/**
 * Serializable version of InterviewSession for JSON storage
 */
interface SerializableSession {
  id: string;
  parsedJD: InterviewSession['parsedJD'];
  questions: InterviewSession['questions'];
  answers: [string, string][]; // Map as array of tuples
  feedback: [string, SerializableAnswerFeedback][]; // Map as array of tuples
  sessionFeedback: InterviewSession['sessionFeedback'];
  currentQuestionIndex: number;
  isComplete: boolean;
  createdAt: string; // Date as ISO string
  completedAt: string | null; // Date as ISO string or null
}

/**
 * Serializable version of AnswerFeedback with Date as string
 */
interface SerializableAnswerFeedback {
  questionId: string;
  score: number;
  strengths: string[];
  improvements: string[];
  timestamp: string; // Date as ISO string
}

/**
 * Session history entry
 */
export interface SessionHistoryEntry {
  id: string;
  roleType: string;
  experienceLevel: string;
  createdAt: string;
  completedAt: string | null;
  overallScore: number | null;
}

/**
 * Serializes an InterviewSession to JSON-compatible format
 * Requirement 10.1: Serialize Interview_Session objects to JSON format
 * Requirement 10.2: Handle Map and Date serialization
 */
export function serializeSession(session: InterviewSession): string {
  const serializable: SerializableSession = {
    id: session.id,
    parsedJD: session.parsedJD,
    questions: session.questions,
    answers: Array.from(session.answers.entries()),
    feedback: Array.from(session.feedback.entries()).map(([id, feedback]) => [
      id,
      {
        questionId: feedback.questionId,
        score: feedback.score,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        timestamp: feedback.timestamp.toISOString(),
      },
    ]),
    sessionFeedback: session.sessionFeedback,
    currentQuestionIndex: session.currentQuestionIndex,
    isComplete: session.isComplete,
    createdAt: session.createdAt.toISOString(),
    completedAt: session.completedAt ? session.completedAt.toISOString() : null,
  };

  return JSON.stringify(serializable);
}

/**
 * Deserializes a JSON string back to an InterviewSession
 * Requirement 10.2: Deserialize JSON data back to Interview_Session objects
 * Requirement 10.4: Return descriptive error message if deserialization fails
 */
export function deserializeSession(json: string): InterviewSession {
  try {
    const data = JSON.parse(json) as SerializableSession;

    // Validate required fields
    if (!data.id || !data.parsedJD || !data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid session data: missing required fields');
    }

    // Reconstruct Maps from arrays
    const answers = new Map<string, string>(data.answers || []);
    
    const feedback = new Map<string, AnswerFeedback>(
      (data.feedback || []).map(([id, fb]) => [
        id,
        {
          questionId: fb.questionId,
          score: fb.score,
          strengths: fb.strengths,
          improvements: fb.improvements,
          timestamp: new Date(fb.timestamp),
        },
      ])
    );

    // Reconstruct Dates
    const createdAt = new Date(data.createdAt);
    const completedAt = data.completedAt ? new Date(data.completedAt) : null;

    // Validate dates
    if (isNaN(createdAt.getTime())) {
      throw new Error('Invalid session data: createdAt is not a valid date');
    }
    if (data.completedAt && completedAt && isNaN(completedAt.getTime())) {
      throw new Error('Invalid session data: completedAt is not a valid date');
    }

    return {
      id: data.id,
      parsedJD: data.parsedJD,
      questions: data.questions,
      answers,
      feedback,
      sessionFeedback: data.sessionFeedback,
      currentQuestionIndex: data.currentQuestionIndex ?? 0,
      isComplete: data.isComplete ?? false,
      createdAt,
      completedAt,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to deserialize session: Invalid JSON format - ${error.message}`);
    }
    if (error instanceof Error) {
      throw new Error(`Failed to deserialize session: ${error.message}`);
    }
    throw new Error('Failed to deserialize session: Unknown error');
  }
}

/**
 * Saves a session to local storage
 * Requirement 6.1: Create a persistent session record
 */
export function saveSession(session: InterviewSession): void {
  if (typeof window === 'undefined') {
    throw new Error('Local storage is not available in server-side context');
  }

  try {
    const serialized = serializeSession(session);
    localStorage.setItem(STORAGE_KEYS.session(session.id), serialized);
    
    // Also save as current session
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, session.id);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Failed to save session: Local storage quota exceeded');
    }
    throw error;
  }
}

/**
 * Loads a session from local storage
 * Requirement 6.3: Restore previous session state
 */
export function loadSession(sessionId: string): InterviewSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.session(sessionId));
    if (!serialized) {
      return null;
    }

    return deserializeSession(serialized);
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
}

/**
 * Gets the current session ID
 */
export function getCurrentSessionId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
}

/**
 * Loads the current session
 * Requirement 6.4: Restore the previous session state when candidate returns
 */
export function loadCurrentSession(): InterviewSession | null {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    return null;
  }

  return loadSession(sessionId);
}

/**
 * Clears the current session
 */
export function clearCurrentSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
}

/**
 * Deletes a session from local storage
 */
export function deleteSession(sessionId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.session(sessionId));
}

/**
 * Saves session history entry
 * Requirement 6.6: Maintain a history of all completed sessions
 */
export function saveSessionToHistory(session: InterviewSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const history = getSessionHistory();
    
    // Check if session already exists in history
    const existingIndex = history.findIndex((entry) => entry.id === session.id);
    
    const historyEntry: SessionHistoryEntry = {
      id: session.id,
      roleType: session.parsedJD.roleType,
      experienceLevel: session.parsedJD.experienceLevel,
      createdAt: session.createdAt.toISOString(),
      completedAt: session.completedAt ? session.completedAt.toISOString() : null,
      overallScore: session.sessionFeedback?.overallScore ?? null,
    };

    if (existingIndex >= 0) {
      // Update existing entry
      history[existingIndex] = historyEntry;
    } else {
      // Add new entry
      history.push(historyEntry);
    }

    localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save session to history:', error);
  }
}

/**
 * Gets the session history
 * Requirement 6.6: Maintain a history of all completed sessions
 */
export function getSessionHistory(): SessionHistoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const historyJson = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
    if (!historyJson) {
      return [];
    }

    return JSON.parse(historyJson) as SessionHistoryEntry[];
  } catch (error) {
    console.error('Failed to load session history:', error);
    return [];
  }
}

/**
 * Clears all session data from local storage
 */
export function clearAllSessions(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const history = getSessionHistory();
  
  // Delete all session data
  history.forEach((entry) => {
    deleteSession(entry.id);
  });

  // Clear history and current session
  localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
}
