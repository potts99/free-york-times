import { initLlama, LlamaContext } from 'llama.rn';
import * as FileSystem from 'expo-file-system';

const MODEL_URL = 'https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-1.5B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf';
const MODEL_FILENAME = 'deepseek-r1-1.5b-q4.gguf';

export interface LLMServiceState {
  status: 'idle' | 'downloading' | 'loading' | 'ready' | 'error';
  progress: number;
  error: string | null;
}

class LLMService {
  private context: LlamaContext | null = null;
  private modelPath: string | null = null;
  private listeners: Set<(state: LLMServiceState) => void> = new Set();
  private state: LLMServiceState = {
    status: 'idle',
    progress: 0,
    error: null,
  };

  private updateState(partial: Partial<LLMServiceState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: LLMServiceState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): LLMServiceState {
    return this.state;
  }

  async getModelPath(): Promise<string> {
    const modelDir = `${FileSystem.documentDirectory}models/`;
    const modelPath = `${modelDir}${MODEL_FILENAME}`;

    // Check if model already exists
    const info = await FileSystem.getInfoAsync(modelPath);
    if (info.exists) {
      return modelPath;
    }

    // Create directory if needed
    await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });

    // Download model
    this.updateState({ status: 'downloading', progress: 0 });

    const downloadResumable = FileSystem.createDownloadResumable(
      MODEL_URL,
      modelPath,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        this.updateState({ progress: progress * 100 });
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result?.uri) {
      throw new Error('Failed to download model');
    }

    return modelPath;
  }

  async initialize(): Promise<void> {
    if (this.context) {
      return; // Already initialized
    }

    try {
      this.modelPath = await this.getModelPath();

      this.updateState({ status: 'loading', progress: 0 });

      this.context = await initLlama({
        model: this.modelPath,
        n_ctx: 2048,
        n_gpu_layers: 99, // Use GPU if available
        n_threads: 4,
      });

      this.updateState({ status: 'ready', progress: 100 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.updateState({ status: 'error', error: message });
      throw error;
    }
  }

  async generate(prompt: string, maxTokens: number = 512): Promise<string> {
    if (!this.context) {
      throw new Error('LLM not initialized. Call initialize() first.');
    }

    const result = await this.context.completion({
      prompt,
      n_predict: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
      stop: ['</s>', '<|endoftext|>', '\n\n\n'],
    });

    return result.text.trim();
  }

  async generateWithMessages(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    maxTokens: number = 512
  ): Promise<string> {
    if (!this.context) {
      throw new Error('LLM not initialized. Call initialize() first.');
    }

    const result = await this.context.completion({
      messages,
      n_predict: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
    });

    return result.text.trim();
  }

  async release(): Promise<void> {
    if (this.context) {
      await this.context.release();
      this.context = null;
      this.updateState({ status: 'idle', progress: 0 });
    }
  }

  isReady(): boolean {
    return this.state.status === 'ready';
  }
}

// Singleton instance
export const llmService = new LLMService();
