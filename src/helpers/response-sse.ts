export const responseSSE = (
  { request }: { request: Request },
  callback: (sendEvent: (data: any) => void) => Promise<void>
) => {
  const body = new ReadableStream({
    async start(controller) {
      // Text encoder for converting strings to Uint8Array
      const encoder = new TextEncoder();

      // Send event to client
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(data));

        if (data === null) {
          controller.close();
        }
      };

      callback(sendEvent);

      // Handle the connection closing
      request.signal.addEventListener('abort', () => {
        controller.close();
      });
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
