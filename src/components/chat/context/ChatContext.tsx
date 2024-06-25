import { createContext } from 'react';

interface ChatContextProps {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

export const ChatContext = createContext<ChatContextProps>({
  addMessage: () => {},
  message: '',
  handleInputChange: () => {},
  isLoading: false,
});