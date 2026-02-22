# Session Management Library

This library provides comprehensive session management for the MockMatch interview application, including state management, local storage persistence, and auto-save functionality.

## Components

### SessionManager (`session-manager.ts`)

Core session state management logic.

**Key Methods:**
- `createSession(parsedJD, questions)` - Creates a new interview session
- `storeAnswer(session, questionId, answer)` - Stores an answer
- `getAnswer(session, questionId)` - Retrieves an answer
- `storeFeedback(session, feedback)` - Stores feedback for a question
- `completeSession(session)` - Marks session as complete
- `areAllQuestionsAnswered(session)` - Checks if all questions answered
- `nextQuestion(session)` / `previousQuestion(session)` - Navigation
- `getCurrentQuestion(session)` - Gets current question

**Example:**
```typescript
import { sessionManager } from '@/lib';

const session = sessionManager.createSession(parsedJD, questions);
const updatedSession = sessionManager.storeAnswer(session, questionId, answer);
```

### Storage (`storage.ts`)

Handles serialization/deserialization and local storage operations.

**Key Functions:**
- `serializeSession(session)` - Converts session to JSON string
- `deserializeSession(json)` - Converts JSON back to session
- `saveSession(session)` - Saves to local storage
- `loadSession(sessionId)` - Loads from local storage
- `loadCurrentSession()` - Loads the active session
- `saveSessionToHistory(session)` - Adds to history
- `getSessionHistory()` - Gets all completed sessions

**Storage Keys:**
- `mockmatch:current-session` - Current active session ID
- `mockmatch:session-history` - Array of completed session metadata
- `mockmatch:session:{id}` - Individual session data

**Example:**
```typescript
import { saveSession, loadCurrentSession } from '@/lib';

saveSession(session);
const restored = loadCurrentSession();
```

### SessionPersistence (`session-persistence.ts`)

Manages auto-save and session restoration.

**Key Methods:**
- `startAutoSave(session)` - Starts auto-save (every 30 seconds)
- `stopAutoSave()` - Stops auto-save
- `updateSession(session)` - Updates session reference for auto-save
- `restoreCurrentSession()` - Restores last active session
- `completeSession(session)` - Completes and saves to history
- `getHistory()` - Gets session history
- `hasSessionInProgress()` - Checks for incomplete session
- `cleanup()` - Cleanup before unmount

**Example:**
```typescript
import { sessionPersistence } from '@/lib';

// Start auto-save when session begins
sessionPersistence.startAutoSave(session);

// Update session reference after state changes
sessionPersistence.updateSession(updatedSession);

// Restore on page load
const restored = sessionPersistence.restoreCurrentSession();

// Complete session
sessionPersistence.completeSession(session);

// Cleanup on unmount
useEffect(() => {
  return () => sessionPersistence.cleanup();
}, []);
```

## React Integration Example

```typescript
import { useEffect, useState } from 'react';
import { sessionManager, sessionPersistence } from '@/lib';
import { InterviewSession } from '@/types';

function InterviewPage() {
  const [session, setSession] = useState<InterviewSession | null>(null);

  // Restore session on mount
  useEffect(() => {
    const restored = sessionPersistence.restoreCurrentSession();
    if (restored) {
      setSession(restored);
    }
  }, []);

  // Start auto-save when session exists
  useEffect(() => {
    if (session) {
      sessionPersistence.startAutoSave(session);
      return () => sessionPersistence.cleanup();
    }
  }, [session?.id]);

  // Update session reference when state changes
  useEffect(() => {
    if (session) {
      sessionPersistence.updateSession(session);
    }
  }, [session]);

  const handleAnswerSubmit = (answer: string) => {
    if (!session) return;
    
    const currentQuestion = sessionManager.getCurrentQuestion(session);
    const updatedSession = sessionManager.storeAnswer(
      session,
      currentQuestion.id,
      answer
    );
    
    setSession(updatedSession);
  };

  const handleComplete = () => {
    if (!session) return;
    
    const completedSession = sessionManager.completeSession(session);
    sessionPersistence.completeSession(completedSession);
    setSession(null);
  };

  return (
    // Your UI components
  );
}
```

## Features

### ✅ Session State Management
- Create and manage interview sessions
- Store answers and feedback
- Track progress through questions
- Session completion logic

### ✅ Local Storage Persistence
- Serialize/deserialize with Map and Date support
- Save and load sessions
- Session history management
- Error handling for corrupted data

### ✅ Auto-Save
- Automatic save every 30 seconds
- Manual save on demand
- Session restoration on page reload
- Cleanup on unmount

### ✅ Type Safety
- Full TypeScript support
- Zod schema validation
- Type-safe APIs

## Requirements Satisfied

- **3.1**: Create new Interview_Session when candidate starts
- **3.3**: Store answer with associated question identifier
- **3.4**: Maintain order of questions and answers
- **3.5**: Mark session as complete when all questions answered
- **6.1**: Create persistent session record
- **6.2**: Store all questions, answers, and feedback
- **6.3**: Preserve session state when navigating away
- **6.4**: Restore previous session state when returning
- **6.5**: Associate each session with its Job_Description
- **6.6**: Maintain history of all completed sessions
- **10.1**: Serialize Interview_Session to JSON
- **10.2**: Deserialize JSON back to Interview_Session
- **10.4**: Handle deserialization errors with descriptive messages

## Testing

All functionality is covered by unit tests:
- `tests/unit/lib/session-manager.test.ts` - Core session logic
- `tests/unit/lib/storage.test.ts` - Serialization and storage

Run tests:
```bash
npm test -- tests/unit/lib/
```
