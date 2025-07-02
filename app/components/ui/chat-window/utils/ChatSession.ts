import ChatMessageType from "@/app/components/types/ChatMessageType";
import { Message } from "ai/react";
import { PostDataType } from "./types";

export default class ChatSession {
    public messages: Message[];
    private langchainDebugMessages: Map<string, Object>;
    public messagesTypes: ChatMessageType[];
    public streaming: boolean;
  
    constructor() {
        this.messages = [];
        this.messagesTypes = [];
        this.langchainDebugMessages = new Map()
        this.streaming = false
    } 
  
    push = (f4role: "user" | "system" | "tool_response" | "tool_init" | "error" | "auth", nextjsrole: "user" | "assistant" | "system" | "tool", message:string, startTime:number, debug?: Object, status?: "pending" | "completed" | "cancelled") => {
      let id = this.messagesTypes.length.toString()
      this.messagesTypes.push({
        id: id, 
        role: f4role, 
        content: message,
        tool_calls: [],
        finishTime: new Date().getTime(),
        startTime: startTime,
      })
  
      this.messages.push(
        { 
          id: this.messages.length.toString(), 
          content: message, 
          role: nextjsrole 
        }
      );

      if(debug) {
        this.langchainDebugMessages.set(String(id), debug)
      }

      if(status) {
        this.messagesTypes[this.messagesTypes.length - 1].status = status
      }
  
      return this
    } 
  
    clear = () => {
      this.messages = [];
      this.messagesTypes = [];
    }
    
    send = async (data: PostDataType) => {
      try {
        const response = await fetch('/api/llm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
  
        if(!response.ok){
          return null
        }
  
        const stream = response.body;
        if(stream) {
          return stream.getReader()
        }
        return null
      } 
      catch(err) {
        console.error("An error occured when fetching the stream reader: ", err)
        let chatErrMsg = { 
          id: this.messages.length.toString(), 
          content: "[ERROR] Connection error. Either the connection to the server has been broken or your connection is not stable. Please come back later and try again.", 
          role: "error" as const, 
          tool_calls: [], 
          finishTime: new Date().getTime(),
          startTime: new Date().getTime()
        }
  
        this.messagesTypes.push(chatErrMsg)
  
      } 
    }
  
    getMessages = () => {
      return this.messagesTypes
    }
  
    toNextJSMessage = (role: "user" | "assistant" | "system" | "tool") => {
      return this.messagesTypes.map((m) => {
        return {
          id: m.id,
          role: role,
          content: m.content,
          tool_calls: m.tool_calls,
          finishTime: m.finishTime,
          startTime: m.startTime
        }
      })   
    }
  
    getNextJSMessages = () => {
      return this.messages
    }

    getDebug = (id:string) => {
      return this.langchainDebugMessages.get(id)
    }

    pushToken = (token: string) => {
      this.messages[this.messages.length - 1].content += token
      this.messagesTypes[this.messagesTypes.length - 1].content += token
      this.messagesTypes[this.messagesTypes.length - 1].finishTime = Date.now()
    }

    updateStatus = (key: string, status: "pending" | "completed" | "cancelled") => {
      console.log("Status: ", status)
      // Create a new array with the updated message to ensure React detects the change
      this.messagesTypes = this.messagesTypes.map((msg) => {
        if (msg.id === key) {
          return { ...msg, status: status };
        }
        return msg;
      });
      console.log("Updated status: ", this.messagesTypes.find((m) => m.id === key)?.status)
      return this
    }
  }