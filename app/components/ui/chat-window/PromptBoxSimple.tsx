/**
 */

"use client"
import { useChat } from "ai/react";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import ChatAIMessage from "../chat-messages/ChatAIMessage";
import ChatToolMessage from "../chat-messages/ChatToolMessage";
import ChatInitToolCallMessage from "../chat-messages/ChatInitToolCallMessage";
import ChatMessageType from "../../types/ChatMessageType";
import ChatUserMessage from "../chat-messages/ChatUserMessage";
import ChatErrorMessage from "../chat-messages/ChatErrorMessage";
import Timer from "../misc/Timer";
import UserInput from "./UserInput";
import ModelSelector from "./ModelSelector";
import config from "../../../../f4.config";
import Canvas from "./Canvas";
import ChatSession from "./utils/ChatSession";
import StreamProcessor from "./utils/StreamProcessor";
import { PostDataType } from "./utils/types";
import { RotateCcw } from "lucide-react";

/**
 * PromptBox is the text input box at the bottom of the screen on /f4rmers/details page
 * when the send button is pressed a request is sent to the /llm endpoint which 
 * will return a response from the f4rmer that is currently selected
 * 
 * @param toolbox -- the set of tools that the f4rmer can use
 * @param description -- system prompt created when the f4rmer was created
 * @param session -- current f4 user session
 * 
 * @returns 
 */
export default function PromptBoxSimple({uti, description}: {uti: string, description: string}) {

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const [promptForUserLogin, setPromptForUserLogin] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<any>(config.models[Object.keys(config.models)[0]][0]);

  const [chatSession, setChatSession] = useState<ChatSession>(new ChatSession())

  const transport:"MCP"|"REST" = "REST"

  /** Absolutely needed */
  const [currentSession, setCurrentSession] = useState<ChatMessageType[]>([]) 
  const { messages, input, setInput, handleInputChange, setMessages } = useChat({});
  const [loading, setLoading] = useState<boolean>(false)
  const [latestMessage, setLatestMessage] = useState<string>("")

  useEffect(() => {
    setMessages(chatSession.getNextJSMessages())
  }, [chatSession.getMessages()])

  useEffect(() => {
    setMessages(chatSession.getNextJSMessages())
  }, [chatSession.getMessages()])

  /**
   * processStream processes the incoming stream of messages from the LLM.
   * Reads chunks of data from the stream, decodes them, and passes them to the StreamProcessor
   * for handling agent messages and tool responses.
   * 
   * @param id - Message ID counter
   * @param reader - ReadableStream reader for the response
   * @param MSStart - Timestamp when the stream processing started
   */
  async function processStream(id:number, reader:ReadableStreamDefaultReader<Uint8Array>, MSStart: number) {
    try {
      while (true) {
        id++
        const { done, value } = await reader.read();
  
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        StreamProcessor.processTokenChunk(chunk, chatSession, MSStart, setLatestMessage, loading)
      }
    } catch (err) {
      console.error(err)
      chatSession.push("error", "system", "Connection error. Either the connection to the server has been broken or your connection is not stable. Please come back later and try again.", 0)
    } finally {
      setLoading(false);
    }
  }


  //let postData: PostDataType = {
  //  messages: chatSession.getNextJSMessages(), 
  //  description: description,
  //  show_intermediate_steps: false,
  //  email: "",
  //  provider: "",
  //  token: "",
  //  f4rmer: uti,
  //  model: selectedModel
  //}

  /**
   * sendMessage handles the submission of user messages to the LLM.
   * - Checks if user needs to login after every 4 messages
   * - Validates input and prevents empty submissions
   * - Adds the user message to the chat session
   * - Initiates the LLM response stream
   * 
   * @param e - Form submission event
   */
  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (input.length == 0) {
      return
    }
    // TODO: make it so that I need to type nextjsrole and f4role
    chatSession.push("user", "user", input, 0)
    setInput("")

    // Add session to the components chat message storage
    setCurrentSession(chatSession.getMessages())

    // Hopefully we can remove messages in the future
    setMessages(chatSession.toNextJSMessage("user"))

    // show loading animation
    let MSStart = new Date().getTime()
    setLoading(true)

    if(selectedModel == null){
      alert("Please select a model to use.")
      return
    }

    let postData: PostDataType = {
      messages: chatSession.getNextJSMessages(), 
      description: description,
      show_intermediate_steps: false,
      f4rmer: "",
      session: {access_token: "", provider: "", expires: "", user: {name: "", email: "", image: ""}},
      model: selectedModel,
      tools: [],
      allowList: [] 
    }

    // Send message
    const stream = await chatSession.send(postData)
    if(!stream) {
      alert("There was a server error while sending your request. This is completely our, fault we will do better in the future.")
      return
    }

    await processStream(chatSession.getMessages().length, stream, MSStart) 
  }
  

  return (
    <div className="sm:flex overflow-hidden w-[100%]">
      <div className={`flex transition-all w-[100%]`}>
        <div className={`flex w-full rounded-xl overflow-auto w-[100%]`}>
          <div className="flex flex-col w-[100%] md:p-0 grow overflow-hidden">
            {currentSession.length === 0 ? (
              <></>
            ) : null}
            <div
              className={`no-scrollbar flex flex-col-reverse w-full mb-4 pb-20 pl-7 gap-5 transition-all duration-500 overflow-y-scroll scrollb ${currentSession.length > 0 ? 'opacity-100' : 'opacity-0 h-0'}`}
              ref={messageContainerRef}
            >
              {loading ? 
                <div className="flex gap-2"><img className="h-[30px] rounded-full" src="https://f4-public.s3.eu-central-1.amazonaws.com/public/assets/f4-logo-yellow-small.png"/> <div className='p-2'><p><span className="">🤔</span> thinking...</p><div className="text-xs bg-black rounded-full p-1 border border-neutral-700"><Timer /></div></div></div>
                :
                <></>
              }
              {currentSession.length > 0 ? (
                [...currentSession]
                  .reverse()
                  .map((m, i) => {
                    switch (m.role) {
                      case "user":
                        return (<ChatUserMessage key={i} content={m.content} timestamp={m.finishTime}/>)
                      case "tool_init":
                        return (<ChatInitToolCallMessage key={i} message={m.content} debug={chatSession.getDebug(m.id) ?? {message: "no extra information"}}/>)
                      case "system":
                        return (<ChatAIMessage key={i} id={m.id} message={m.content} latency={m.finishTime - m.startTime}/>)
                      case "tool_response":
                        return (<ChatToolMessage key={i} message={m.content} debug={chatSession.getDebug(m.id) ?? {message: "no extra information"}}/>)
                      case "error":
                        return (<ChatErrorMessage key={i} content={m.content}/>)
                    }
                  })
              ) : (
                ""
              )}
            </div>
          <div className={`transition-all duration-500 ease-in-out w-[100%] p-5 ${currentSession.length > 0 ? '' : ''}`}>
            <UserInput onSubmit={sendMessage} onChange={handleInputChange} value={input}>
              <div className="flex p-0 mt-2">
                <ModelSelector onModelSelect={(e:any) => {setSelectedModel(e)}} selectedModel={selectedModel}/>
              </div>
            </UserInput>
          </div>
        </div>
      </div>
      <div className="absolute bg-transparent right-[3%] top-[10%]">
        <div className={`flex flex-col gap-2 ${messages.length == 0 ? "opacity-0" : "opacity-100"}`}>
          <button onClick={() => {setMessages([]);setCurrentSession([])}} className={`transition-all hover:rotate-[-90deg] rounded-md p-2 ${config.theme.textColorPrimary ? config.theme.textColorPrimary : "text-white"}`}><RotateCcw size={15}/></button>
        </div> 
      </div>
      </div>
      <div className={`flex transition-all ease-in-out text-white rounded-md w-full bg-white hidden`}>
        <Canvas />
      </div>
    </div>
  )
}