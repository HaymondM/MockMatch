import { InterviewSession } from '@/types';
import {
  saveSession,
  loadSession,
  loadCurrentSession,
  clearCurrentSession,
  saveSessionToHistory,
  getSessionHistory,
  SessionHistoryEntry,
} from './storage';

/**
 * Auto-save interval in milliseconds (30 seconds)
 * Requirement 6.3: Auto-save functionality every 30 seconds
 */
const AUTO_SAVE_INTERVAL = 30000;

/**
 * Session Persistence Manager
 * Handles session restoration, history management, and auto-save
 * Requirements: 6.3, 6.4, 6.5, 6.6
 */
export class SessionPersistence {
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private currentSession: InterviewSession | null = null;

  /**
   * Starts auto-save for the current session
   * Requirement 6.3: Auto-save functionality every 30 seconds
   */
  startAutoSave(session: InterviewSession): void {
    // Clear any existing timer
    this.stopAutoSave();

    // Store current session reference
    this.currentSession = session;

    // Set up auto-save interval
    this.autoSaveTimer = setInterval(() => {
      if (this.currentSession) {
        try {
          saveSession(this.currentSession);
          console.log('Session auto-saved:', this.currentSession.id);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, AUTO_SAVE_INTERVAL);

    // Also save immediately
    try {
      saveSession(session);
    } catch (error) {
      console.error('Initial save failed:', error);
    }
  }

  /**
   * Stops auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Updates the current session reference for auto-save
   */
  updateSession(session: InterviewSession): void {
    this.currentSession = session;
  }

  /**
   * Manually saves the current session
   */
  saveCurrentSession(): void {
    if (this.currentSession) {
      try {
        saveSession(this.currentSession);
      } catch (error) {
        console.error('Manual save failed:', error);
        throw error;
      }
    }
  }

  /**
   * Restores a session from local storage
   * Requirement 6.4: Restore the previous session state when candidate returns
   */
  restoreSession(sessionId: string): InterviewSession | null {
    try {
      const session = loadSession(sessionId);
      if (session) {
        this.currentSession = session;
        // Start auto-save for restored session
        this.startAutoSave(session);
      }
      return session;
    } catch (error) {
      console.error('Failed to restore session:', error);
      return null;
    }
  }

  /**
   * Restores the current session (last active session)
   * Requirement 6.4: Restore the previous session state when candidate returns
   */
  restoreCurrentSession(): InterviewSession | null {
    try {
      const session = loadCurrentSession();
      if (session) {
        this.currentSession = session;
        // Start auto-save for restored session
        this.startAutoSave(session);
      }
      return session;
    } catch (error) {
      console.error('Failed to restore current session:', error);
      return null;
    }
  }

  /**
   * Completes a session and adds it to history
   * Requirement 6.6: Maintain a history of all completed sessions
   */
  completeSession(session: InterviewSession): void {
    try {
      // Save the completed session
      saveSession(session);

      // Add to history
      saveSessionToHistory(session);

      // Clear current session reference
      clearCurrentSession();

      // Stop auto-save
      this.stopAutoSave();
      this.currentSession = null;

      console.log('Session completed and saved to history:', session.id);
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw error;
    }
  }

  /**
   * Gets the session history
   * Requirement 6.6: Maintain a history of all completed sessions
   */
  getHistory(): SessionHistoryEntry[] {
    return getSessionHistory();
  }

  /**
   * Loads a session from history
   * Requirement 6.5: Associate each session with its Job_Description
   */
  loadFromHistory(sessionId: string): InterviewSession | null {
    return loadSession(sessionId);
  }

  /**
   * Checks if there's a session in progress
   */
  hasSessionInProgress(): boolean {
    const session = loadCurrentSession();
    return session !== null && !session.isComplete;
  }

  /**
   * Clears the current session (abandons it)
   */
  clearSession(): void {
    this.stopAutoSave();
    this.currentSession = null;
    clearCurrentSession();
  }

  /**
   * Cleanup method to be called when component unmounts
   */
  cleanup(): void {
    // Save one last time before cleanup
    if (this.currentSession) {
      try {
        saveSession(this.currentSession);
      } catch (error) {
        console.error('Final save failed:', error);
      }
    }

    this.stopAutoSave();
  }
}

// Export a singleton instance
export const sessionPersistence = new SessionPersistence();

/**
 * Hook cleanup function for React components
 * Call this in useEffect cleanup
 */
export function cleanupSessionPersistence(): void {
  sessionPersistence.cleanup();
}
