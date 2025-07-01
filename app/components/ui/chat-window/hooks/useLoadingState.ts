import { useState, useEffect } from 'react';
import config from '../../../../../f4.config';

export const useLoadingState = () => {
  const [loading, setLoading] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState("");

  const setRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * config.loadingMessages.length);
    setCurrentLoadingMessage(config.loadingMessages[randomIndex]);

  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setRandomMessage()
      interval = setInterval(() => {
        setRandomMessage()
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  return {
    loading,
    setLoading,
    currentLoadingMessage,
  };
};
