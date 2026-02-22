/**
 * Session Management Library
 * Exports all session-related functionality
 */

// Core session manager
export { SessionManager, sessionManager } from './session-manager';

// Storage utilities
export {
  STORAGE_KEYS,
  serializeSession,
  deserializeSession,
  saveSession,
  loadSession,
  getCurrentSessionId,
  loadCurrentSession,
  clearCurrentSession,
  deleteSession,
  saveSessionToHistory,
  getSessionHistory,
  clearAllSessions,
  type SessionHistoryEntry,
} from './storage';

// Session persistence with auto-save
export {
  SessionPersistence,
  sessionPersistence,
  cleanupSessionPersistence,
} from './session-persistence';
