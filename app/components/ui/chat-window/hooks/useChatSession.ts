import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import ChatSession from '../utils/ChatSession';
import ChatMessageType from '../../../types/ChatMessageType';
import config from '../../../../../f4.config';

export const useChatSession = () => {
  const { input, setInput, handleInputChange, setMessages } = useChat({});
  const [chatSession, setChatSession] = useState<ChatSession>(new ChatSession());
  const [currentSession, setCurrentSession] = useState<ChatMessageType[]>([]);
  const [latestMessage, setLatestMessage] = useState<string>("");
  const [welcomeMessage, setWelcomeMessage] = useState<string>();
  const currentReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  useEffect(() => {
    setMessages(chatSession.messages);
  }, [latestMessage, chatSession.messages, setMessages]);

  const clearChat = () => {
    chatSession.clear();
    setCurrentSession([]);
  };

  const updateLatestMessage = () => {
    setLatestMessage(Date.now().toString());
  };

  return {
    input,
    setInput,
    handleInputChange,
    setMessages,
    chatSession,
    setChatSession,
    currentSession,
    setCurrentSession,
    latestMessage,
    welcomeMessage,
    setWelcomeMessage,
    currentReaderRef,
    clearChat,
    updateLatestMessage,
  };
};
