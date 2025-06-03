import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export type UIState = "idle" | "uploading" | "saving"  | "calculating" | "updating" | "success" | "error";

interface UIStateOptions {
  debounceMs?: number;
  autoResetMs?: number;
  enableOptimisticUpdates?: boolean;
}

interface UIStateData {
  state: UIState;
  message?: string;
  progress?: number;
  error?: string;
  data?: any;
}

interface OptimisticUpdate {
  id: string;
  rollbackFn: () => void;
  data: any;
}

export function useUIState(options: UIStateOptions = {}) {
  const {
    debounceMs = 300,
    autoResetMs = 3000,
    enableOptimisticUpdates = false,
  } = options;

  const [uiState, setUIState] = useState<UIStateData>({
    state: "idle",
  });
const debounceRef = useRef<NodeJS.Timeout>();
  const autoResetRef = useRef<NodeJS.Timeout>();
  const optimisticUpdatesRef = useRef<Map<string, OptimisticUpdate>>(new Map());
  const clickCountRef = useRef(0);
  const lastClickRef = useRef(0);

  // Debounced state setter
  const setStateDebounced = useCallback((newState: UIStateData) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setUIState(newState);
      
      // Auto reset for success/error states
      if ((newState.state === 'success' || newState.state === 'error') && autoResetMs > 0) {
        if (autoResetRef.current) {
          clearTimeout(autoResetRef.current);
        }
        
        autoResetRef.current = setTimeout(() => {
          setUIState({ state: 'idle' });
        }, autoResetMs);
      }
    }, debounceMs);
  }, [debounceMs, autoResetMs]);

  // Prevent multiple clicks
  const withDebounce = useCallback((fn: () => void | Promise<void>) => {
    return async () => {
      const now = Date.now();
      
      // Prevent rapid clicks
      if (now - lastClickRef.current < debounceMs) {
        clickCountRef.current++;
        console.log(`Debounced click #${clickCountRef.current}`);
        return;
      }
      
      lastClickRef.current = now;
      clickCountRef.current = 0;
      
      try {
        await fn();
      } catch (error) {
        console.error('Debounced function error:', error);
      }
    };
  }, [debounceMs]);

  // Optimistic updates
  const addOptimisticUpdate = useCallback((id: string, data: any, rollbackFn: () => void) => {
    if (!enableOptimisticUpdates) return;
    
    optimisticUpdatesRef.current.set(id, {
      id,
      rollbackFn,
      data
    });
  }, [enableOptimisticUpdates]);

  const commitOptimisticUpdate = useCallback((id: string) => {
    optimisticUpdatesRef.current.delete(id);
  }, []);

  const rollbackOptimisticUpdate = useCallback((id: string) => {
    const update = optimisticUpdatesRef.current.get(id);
    if (update) {
      update.rollbackFn();
      optimisticUpdatesRef.current.delete(id);
    }
  }, []);

  const rollbackAllOptimisticUpdates = useCallback(() => {
    optimisticUpdatesRef.current.forEach(update => {
      update.rollbackFn();
    });
    optimisticUpdatesRef.current.clear();
  }, []);

  // State management functions
  const setIdle = useCallback(() => {
    setStateDebounced({ state: 'idle' });
  }, [setStateDebounced]);

  const setUploading = useCallback((message?: string, progress?: number) => {
    setStateDebounced({
      state: 'uploading',
      message: message || 'Uploading...',
      progress
    });
  }, [setStateDebounced]);

  const setSaving = useCallback((message?: string, progress?: number) => {
    setStateDebounced({
      state: 'saving',
      message: message || 'Saving...',
      progress
    });
  }, [setStateDebounced]);

  const setCalculating = useCallback((message?: string, progress?: number) => {
    setStateDebounced({
      state: 'calculating',
      message: message || 'Calculating...',
      progress
    });
  }, [setStateDebounced]);

  const setUpdating = useCallback((message?: string, progress?: number) => {
    setStateDebounced({
      state: 'updating',
      message: message || 'Updating...',
      progress
    });
  }, [setStateDebounced]);

  const setSuccess = useCallback((message?: string, data?: any) => {
    setStateDebounced({
      state: 'success',
      message: message || 'Operation completed successfully!',
      data
    });
  }, [setStateDebounced]);

  const setError = useCallback((message?: string, error?: string) => {
    setStateDebounced({
      state: 'error',
      message: message || 'An error occurred',
      error
    });
    
    // Rollback optimistic updates on error
    rollbackAllOptimisticUpdates();
  }, [setStateDebounced, rollbackAllOptimisticUpdates]);

  // Progress update
  const updateProgress = useCallback((progress: number, message?: string) => {
    setUIState(prev => ({
      ...prev,
      progress,
      message: message || prev.message
    }));
  }, []);

  // Async operation wrapper
  const withAsyncState = useCallback(async <T>(
    operation: () => Promise<T>,
    loadingState: UIState = 'saving',
    loadingMessage?: string
  ): Promise<T> => {
    try {
      setStateDebounced({
        state: loadingState,
        message: loadingMessage
      });

      const result = await operation();
      
      setSuccess('Operation completed successfully!');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError('Operation failed', errorMessage);
      throw error;
    }
  }, [setStateDebounced, setSuccess, setError]);

  // Batch operations
  const withBatchOperations = useCallback(async <T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 3
  ): Promise<T[]> => {
    const results: T[] = [];
    const total = operations.length;
    
    setStateDebounced({
      state: 'saving',
      message: `Processing ${total} operations...`,
      progress: 0
    });

    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
      
      const progress = Math.round(((i + batch.length) / total) * 100);
      updateProgress(progress, `Processed ${i + batch.length}/${total} operations`);
    }

    setSuccess(`Successfully processed ${total} operations!`);
    return results;
  }, [setStateDebounced, updateProgress, setSuccess]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (autoResetRef.current) {
        clearTimeout(autoResetRef.current);
      }
    };
  }, []);

  return {
    // State
    uiState,
    isLoading: ['uploading', 'saving', 'calculating', 'updating'].includes(uiState.state),
    isIdle: uiState.state === 'idle',
    isSuccess: uiState.state === 'success',
    isError: uiState.state === 'error',
    
    // State setters
    setIdle,
    setUploading,
    setSaving,
    setCalculating,
    setUpdating,
    setSuccess,
    setError,
    updateProgress,
    
    // Utilities
    withDebounce,
    withAsyncState,
    withBatchOperations,
    
    // Optimistic updates
    addOptimisticUpdate,
    commitOptimisticUpdate,
    rollbackOptimisticUpdate,
    rollbackAllOptimisticUpdates,
    
    // Stats
    clickCount: clickCountRef.current,
  };
}

// Cache management hook
export function useCache<T>(key: string, ttl: number = 5 * 60 * 1000) {
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const get = useCallback((cacheKey: string): T | null => {
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > ttl) {
      cacheRef.current.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }, [ttl]);

  const set = useCallback((cacheKey: string, data: T) => {
    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }, []);

  const clear = useCallback((cacheKey?: string) => {
    if (cacheKey) {
      cacheRef.current.delete(cacheKey);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const has = useCallback((cacheKey: string): boolean => {
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return false;
    
    if (Date.now() - cached.timestamp > ttl) {
      cacheRef.current.delete(cacheKey);
      return false;
    }
    
    return true;
  }, [ttl]);

  return { get, set, clear, has };
}