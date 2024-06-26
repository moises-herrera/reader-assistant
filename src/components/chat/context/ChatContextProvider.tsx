import { FC, useRef, useState } from 'react';
import { ChatContext } from '@/components/chat/context/ChatContext';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { trpc } from '@/app/_trpc/client';
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';
import { Message } from '@/interfaces/message';

interface ChatContextProviderProps {
  fileId: string;
  children: React.ReactNode;
}

export const ChatContextProvider: FC<ChatContextProviderProps> = ({
  fileId,
  children,
}) => {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const utils = trpc.useUtils();

  const { toast } = useToast();

  const backupMessage = useRef<string>('');

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({ fileId, message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage('');

      await utils.getFileMessages.cancel();

      const previousMessages = utils.getFileMessages.getInfiniteData();

      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          let newPages = [...old.pages];

          let latestPage = newPages[0];

          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: backupMessage.current,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ];

          newPages[0] = latestPage;

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      setIsLoading(true);

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream) => {
      setIsLoading(false);

      if (!stream) {
        return toast({
          title: 'There was a problem sending this message',
          description: 'Pease refresh this page and try again',
          variant: 'destructive',
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      let accumulatedResponse = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        accumulatedResponse += chunkValue;

        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          (old) => {
            if (!old) {
              return {
                pages: [],
                pageParams: [],
              };
            }

            const isAiResponseCreated = old.pages.some((page) =>
              page.messages.some(({ id }) => id === 'ai-response')
            );

            const updatedPages = old.pages.map((page) => {
              if (page === old.pages[0]) {
                let updatedMessages: Message[];

                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: 'ai-response',
                      text: accumulatedResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  updatedMessages = page.messages.map((message) => {
                    if (message.id === 'ai-response') {
                      return {
                        ...message,
                        text: accumulatedResponse,
                      };
                    }

                    return message;
                  });
                }

                return {
                  ...page,
                  messages: updatedMessages,
                };
              }

              return page;
            });

            return {
              ...old,
              pages: updatedPages,
            };
          }
        );
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId },
        {
          messages: context?.previousMessages ?? [],
        }
      );
    },
    onSettled: async () => {
      setIsLoading(false);

      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  const handleInputChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(value);

  const addMessage = () => sendMessage({ message });

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
