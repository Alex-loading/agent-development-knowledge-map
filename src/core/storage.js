import { PROGRESS_VERSION, createDefaultProgress } from './progress.js';

const DEFAULT_KEY = 'agent-learner:progress:v1';

function defaultProgress() {
  return createDefaultProgress('llm-foundation');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidProgress(value) {
  return isRecord(value)
    && value.version === PROGRESS_VERSION
    && typeof value.currentModuleId === 'string'
    && typeof value.currentLessonId === 'string'
    && Array.isArray(value.completedLessonIds)
    && isRecord(value.quizResults)
    && isRecord(value.interviewStatusById)
    && Array.isArray(value.reviewQueue)
    && (value.lastVisitedAt === null || typeof value.lastVisitedAt === 'string');
}

export function createProgressStore(storage, key = DEFAULT_KEY) {
  let memoryValue = defaultProgress();
  let storageMode = 'local';

  function switchToMemory() {
    storageMode = 'memory';
  }

  return {
    load() {
      if (storageMode === 'memory') {
        return clone(memoryValue);
      }

      let serialized;
      try {
        serialized = storage.getItem(key);
      } catch {
        switchToMemory();
        return clone(memoryValue);
      }

      if (serialized === null) {
        memoryValue = defaultProgress();
        return clone(memoryValue);
      }

      try {
        const parsed = JSON.parse(serialized);
        memoryValue = isValidProgress(parsed) ? clone(parsed) : defaultProgress();
      } catch {
        memoryValue = defaultProgress();
      }

      return clone(memoryValue);
    },

    save(state) {
      const serialized = JSON.stringify(state);
      memoryValue = JSON.parse(serialized);

      if (storageMode === 'memory') {
        return;
      }

      try {
        storage.setItem(key, serialized);
      } catch {
        switchToMemory();
      }
    },

    reset() {
      memoryValue = defaultProgress();

      if (storageMode === 'memory') {
        return;
      }

      try {
        storage.removeItem(key);
      } catch {
        switchToMemory();
      }
    },

    mode() {
      return storageMode;
    },
  };
}
