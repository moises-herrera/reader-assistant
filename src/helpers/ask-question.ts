import { db } from '../db';
import { embeddingModel, model } from '../lib/ai-model';
import { pinecone } from '../lib/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { LangChainAdapter, StreamingTextResponse } from 'ai';

export const askQuestionToModel = async (
  message: string,
  fileId: string,
  userId: string
): Promise<StreamingTextResponse> => {
  const pineconeIndex = pinecone.Index('reader');

  const vectorStore = await PineconeStore.fromExistingIndex(embeddingModel, {
    pineconeIndex,
    namespace: fileId,
  });

  const results = await vectorStore.similaritySearch(message, 4);

  const previousMessages = await db.message.findMany({
    where: { fileId },
    orderBy: { createdAt: 'asc' },
    take: 6,
  });

  const formattedMessages = previousMessages.map(({ isUserMessage, text }) => {
    if (isUserMessage) {
      return `User: ${text}\n`;
    }

    return `Assistant: ${text}\n`;
  });

  const prompt = [
    [
      'system',
      `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.`,
    ],
    [
      'human',
      `
       \n----------------\n
  
        PREVIOUS CONVERSATION:
        ${formattedMessages}
        
        \n----------------\n
        
        CONTEXT:
        ${results.map((result) => result.pageContent).join('\n\n')}
        
        USER INPUT: ${message}`,
    ],
  ];

  const stream = await model
    .pipe(new StringOutputParser())
    .stream(JSON.stringify(prompt));

  const aiStream = LangChainAdapter.toAIStream(stream);

  const saveResponse = async () => {
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const output = chunks.join('');

    await db.message.create({
      data: {
        text: output,
        isUserMessage: false,
        fileId,
        userId,
      },
    });
  };

  saveResponse();

  return new StreamingTextResponse(aiStream);
};
