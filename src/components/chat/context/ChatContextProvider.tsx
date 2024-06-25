import { FC, useState } from 'react';
import { ChatContext } from '@/components/chat/context/ChatContext';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';

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

  const { toast } = useToast();

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
