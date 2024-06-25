import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';

export const embeddingModel = new OllamaEmbeddings({
  model: 'llama3',
  baseUrl: 'http://localhost:11434',
});

export const model = new ChatOllama({
  model: 'llama3',
  baseUrl: 'http://localhost:11434',
});
