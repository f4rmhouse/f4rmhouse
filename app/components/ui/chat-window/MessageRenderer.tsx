import React from 'react';
import ChatMessageType from '../../types/ChatMessageType';
import ChatUserMessage from '../chat-messages/ChatUserMessage';
import ChatInitToolCallMessage from '../chat-messages/ChatInitToolCallMessage';
import ChatAIMessage from '../chat-messages/ChatAIMessage';
import ChatToolMessage from '../chat-messages/ChatToolMessage';
import ChatErrorMessage from '../chat-messages/ChatErrorMessage';
import ChatConfirmMessage from '../chat-messages/ChatConfirmMessage';
import ChatSession from './utils/ChatSession';

interface MessageRendererProps {
  messages: ChatMessageType[];
  chatSession: ChatSession;
  onAuthenticate: (message: ChatMessageType) => Promise<void>;
  onCancel: (message: ChatMessageType) => void;
}

export default function MessageRenderer({ 
  messages, 
  chatSession, 
  onAuthenticate, 
  onCancel 
}: MessageRendererProps) {
  
  const renderMessage = (i: number, m: ChatMessageType) => {
    switch (m.role) {
      case "user":
        return (
          <ChatUserMessage 
            key={i} 
            content={m.content} 
            timestamp={m.finishTime} 
          />
        );
      case "tool_init":
        return (
          <ChatInitToolCallMessage 
            key={i} 
            message={m.content} 
            debug={chatSession.getDebug(m.id) ?? { message: "no extra information" }} 
          />
        );
      case "system":
        return (
          <ChatAIMessage 
            key={i} 
            id={m.id}
            message={m.content} 
            latency={m.finishTime - m.startTime}
          />
        );
      case "tool_response":
        return (
          <ChatToolMessage 
            key={i} 
            message={m.content} 
            debug={chatSession.getDebug(m.id) ?? { message: "no extra information" }} 
          />
        );
      case "error":
        return (
          <ChatErrorMessage 
            key={i} 
            content={m.content} 
          />
        );
      case "auth":
        return (
          <ChatConfirmMessage
            onCancel={() => onCancel(m)}
            onAuthenticate={async () => await onAuthenticate(m)}
            key={i}
            uti={m.content}
            uri={m.content}
            deactivated={m.status === "cancelled" || m.status === "completed"}
            state={m.status ?? "pending"}
            debug={chatSession.getDebug(m.id) ?? {}}
          />
        );
      default:
        return (
          <ChatErrorMessage 
            key={i} 
            content={m.content} 
          />
        );
    }
  };

  return (
    <>
      {messages.length > 0 ? (
        [...messages]
          .reverse()
          .map((m, i) => renderMessage(i, m))
      ) : (
        <></>
      )}
    </>
  );
}
