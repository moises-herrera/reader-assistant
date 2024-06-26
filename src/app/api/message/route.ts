import { db } from '@/db';
import { SendMessageValidator } from '@/lib/validators/SendMessageValidator';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest } from 'next/server';
import { askQuestionToModel } from '@/helpers/ask-question';
import { responseSSE } from '@/helpers/response-sse';

/**
 * Ask a question about a PDF file.
 * @param req The incoming request.
 */
export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { id: userId } = user || {};

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: { id: fileId, userId },
  });

  if (!file) {
    return new Response('File not found', { status: 404 });
  }

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  try {
    return responseSSE({ request: req }, async (sendEvent) => {
      const streamingResponse = await askQuestionToModel(message, fileId);

      let result = '';

      for await (const chunk of streamingResponse) {
        result += chunk.content;
        sendEvent(chunk.content);
      }

      await db.message.create({
        data: {
          text: result,
          isUserMessage: false,
          fileId,
          userId,
        },
      });
      sendEvent(null);
    });
  } catch (error) {
    console.error(error);
    return new Response('An error occurred', { status: 500 });
  }
};
