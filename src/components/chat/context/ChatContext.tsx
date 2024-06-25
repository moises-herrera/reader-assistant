import { Context, createContext } from 'react';

interface ChatContextProps {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

export const ChatContext: Context<ChatContextProps> =
  createContext<ChatContextProps>({
    addMessage: () => {},
    message: '',
    handleInputChange: () => {},
    isLoading: false,
  });
