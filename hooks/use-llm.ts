import { useState, useEffect, useCallback } from 'react';
import { llmService, LLMServiceState } from '@/services/llm';

export function useLLM() {
  const [state, setState] = useState<LLMServiceState>(llmService.getState());

  useEffect(() => {
    const unsubscribe = llmService.subscribe(setState);
    return unsubscribe;
  }, []);

  const initialize = useCallback(async () => {
    try {
      await llmService.initialize();
    } catch (error) {
      console.error('Failed to initialize LLM:', error);
    }
  }, []);

  const release = useCallback(async () => {
    try {
      await llmService.release();
    } catch (error) {
      console.error('Failed to release LLM:', error);
    }
  }, []);

  return {
    ...state,
    initialize,
    release,
    isReady: state.status === 'ready',
    isLoading: state.status === 'downloading' || state.status === 'loading',
  };
}
