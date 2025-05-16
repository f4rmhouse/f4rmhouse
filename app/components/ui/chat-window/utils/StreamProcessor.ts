import { LangchainMessageType } from "@/app/components/types/LangchainMessageType";
import ChatSession from "./ChatSession";
import { ToolMessageType } from "@/app/components/types/ToolMessageType";

export default class StreamProcessor {
    static async processChunk(chunk: string, chatSession: ChatSession, startTime: number) {
      const data = JSON.parse(chunk);
      console.log(chunk)
      if (data.agent) {
        await this.processAgentMessage(data.agent[0].kwargs, chatSession, startTime);
      } else {
        await this.processToolMessage(data.tools[0].kwargs, chatSession);
      }
    }
  
    private static async processAgentMessage(langchainMessage: LangchainMessageType, chatSession: ChatSession, startTime: number) {
      langchainMessage.latency = Date.now() - startTime;
      if (langchainMessage.tool_calls.length > 0) {
        langchainMessage.content = JSON.stringify(langchainMessage.tool_calls);
        chatSession.push("tool_init", "system", JSON.stringify(langchainMessage.content), langchainMessage);
      } else {
        chatSession.push("system", "system", langchainMessage.content);
      }
    }
  
    private static async processToolMessage(toolMessage: ToolMessageType, chatSession: ChatSession) {
      chatSession.push("tool_response", "system", toolMessage.content, toolMessage);
    }

    static async processTokenChunk(chunk: string, chatSession: ChatSession, startTime: number, setLatestMessage: (message: string | ((prevMessage: string) => string)) => void, loading: boolean) {
      const vals = (chunk.replaceAll("][", "]<split>[").split("<split>"))
      vals.map((v, _) => {
        if(JSON.parse(v)[0].id[2] == "ToolMessage") {
          chatSession.push("tool_response", "system", JSON.stringify(JSON.parse(v)[0].kwargs.content), JSON.parse(v)[0]);
          chatSession.push("system", "system", "")
        }
        else if (!chatSession.streaming) {
          chatSession.push("system", "system", "")
          chatSession.streaming = true
        }

        else if(Array.isArray(JSON.parse(v)[0].kwargs.content)) {
          // Make sure there is text to render
          if(JSON.parse(v)[0].kwargs.content[0]) {
            chatSession.pushToken(JSON.parse(v)[0].kwargs.content[0].text)
            setLatestMessage((p: string) => p + JSON.parse(v)[0].kwargs.content[0].text)
          }
        }
        else {
          chatSession.pushToken(JSON.parse(v)[0].kwargs.content)
          setLatestMessage((p: string) => p + JSON.parse(v)[0].kwargs.content)
        }
      })
    }
  }