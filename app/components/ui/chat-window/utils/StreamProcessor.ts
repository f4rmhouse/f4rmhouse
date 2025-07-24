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
        chatSession.push("tool_init", "system", JSON.stringify(langchainMessage.content), startTime, langchainMessage);
      } else {
        chatSession.push("system", "system", langchainMessage.content, startTime);
      }
    }
  
    private static async processToolMessage(toolMessage: ToolMessageType, chatSession: ChatSession) {
      chatSession.push("tool_response", "system", toolMessage.content, 0, toolMessage);
    }

    static async processTokenChunk(chunk: string, chatSession: ChatSession, startTime: number, setLatestMessage: (message: string | ((prevMessage: string) => string)) => void, loading: boolean) {
      if(chunk) {
        try {
          let jsonResponse = JSON.parse(chunk)
          if(jsonResponse[0].id[2] == "ToolMessage") {
            // Check if tool is asking for auth
            //let content = JSON.parse(jsonResponse[0].kwargs.content)
            //if(content.code == 401) {
            //  chatSession.push("auth", "system", content.tool_identifier, startTime, content.data)
            //  chatSession.push("system", "system", "", startTime)
            //}
              // Otherwise output tool response
              // else {
                chatSession.push("tool_response", "system", jsonResponse[0].kwargs.content, startTime, JSON.parse(chunk)[0]);
                chatSession.push("system", "system", "", startTime)
              // }
            }
            else if (JSON.parse(chunk)[0].id[2] == "GeneratedContent") {
              chatSession.pushToken(JSON.parse(chunk)[0].content.text)
              setLatestMessage((p: string) => p + JSON.parse(chunk)[0].content.text)
            }
            else if (!chatSession.streaming) {
              // please explain this...
              chatSession.push("system", "system", "", startTime)
              if(JSON.parse(chunk)[0].kwargs.content.length > 0){
                chatSession.pushToken(JSON.parse(chunk)[0].kwargs.content)
                setLatestMessage((p: string) => p + JSON.parse(chunk)[0].kwargs.content)
              }
              chatSession.streaming = true
            }
            else if(Array.isArray(JSON.parse(chunk)[0].kwargs.content)) {
              // Make sure there is text to render
              if(JSON.parse(chunk)[0].kwargs.content[0]) {
                chatSession.pushToken(JSON.parse(chunk)[0].kwargs.content[0].text)
                setLatestMessage((p: string) => p + JSON.parse(chunk)[0].kwargs.content[0].text)
              }
            }
            else {
              chatSession.pushToken(JSON.parse(chunk)[0].kwargs.content)
              setLatestMessage((p: string) => p + JSON.parse(chunk)[0].kwargs.content)
            }
          } catch(e) {
            console.log("Error processing chunk: ", e)
            console.log("Failed Chunk: ", chunk)
          }
        }
    }
  }