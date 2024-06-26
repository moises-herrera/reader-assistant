import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export const embeddingModel = new OllamaEmbeddings({
  model: 'llama3',
  baseUrl: OLLAMA_BASE_URL,
});

export const model = new ChatOllama({
  model: 'llama3',
  baseUrl: OLLAMA_BASE_URL,
});
