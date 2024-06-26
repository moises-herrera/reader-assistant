import { db } from '@/db';
import { embeddingModel, model } from '@/lib/ai-model';
import { pinecone } from '@/lib/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export const askQuestionToModel = async (
  message: string,
  fileId: string,
  userId: string
) => {
  const pineconeIndex = pinecone.Index('reader');

  const vectorStore = await PineconeStore.fromExistingIndex(embeddingModel, {
    pineconeIndex,
    namespace: fileId,
  });

  const results = await vectorStore.similaritySearch(message, 4);
  const context = results.map((result) => result.pageContent).join('\n\n');

  const previousMessages = await db.message.findMany({
    where: { fileId },
    orderBy: { createdAt: 'asc' },
    take: 6,
  });

  const formattedMessages = previousMessages
    .map(({ isUserMessage, text }) => {
      return isUserMessage ? `User: ${text}\n` : `Assistant: ${text}\n`;
    })
    .join('\n');

  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      'system',
      `Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format. If you don't know the answer, just say that you don't know, don't try to make up an answer.
    
      \n----------------\n
    
      PREVIOUS CONVERSATION:
      ${formattedMessages}
      
      \n----------------\n
      
      CONTEXT:
      ${context}
      `,
    ],
    ['user', '{text}'],
  ]);

  const chain = promptTemplate.pipe(model);

  const stream = await chain.stream({
    text: message,
  });

  return stream;
};
