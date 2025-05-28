"use client"
import { useChat } from "ai/react";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useTheme } from "../../../context/ThemeContext";
import F4Session from "../../types/F4Session";
import ProductType from "../../types/ProductType";
import ChatAIMessage from "../chat-messages/ChatAIMessage";
import ChatToolMessage from "../chat-messages/ChatToolMessage";
import ChatInitToolCallMessage from "../chat-messages/ChatInitToolCallMessage";
import ChatMessageType from "../../types/ChatMessageType";
import ChatUserMessage from "../chat-messages/ChatUserMessage";
import ChatErrorMessage from "../chat-messages/ChatErrorMessage";
import { ArrowLeftToLine, ArrowRightToLine, RotateCcw } from "lucide-react";
import Link from "next/link";
import Modal from "../modal/Modal";
import Timer from "../misc/Timer";
import UserInput from "./UserInput";
import ModelSelector from "./ModelSelector";
import AgentSelector from "./AgentSelector";
import config from "../../../../f4.config";
import Canvas from "./Canvas";
import ChatSession from "./utils/ChatSession";
import { PostDataType } from "./utils/types";
import StreamProcessor from "./utils/StreamProcessor";
import F4rmerType from "../../types/F4rmerType";

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
export default function PromptBox({session, state, setState, f4rmers}: {session: F4Session, state: "canvas" | "chat" | "preview", setState: (state: "canvas" | "chat" | "preview") => void, f4rmers: F4rmerType[]}) {
  const { theme } = useTheme();
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [promptForUserLogin, setPromptForUserLogin] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<any>(config.models[Object.keys(config.models)[0]][0]);
  const [selectedAgent, setSelectedAgent] = useState<F4rmerType|undefined>(f4rmers ? f4rmers[0] : undefined);
  const [chatSession, setChatSession] = useState<ChatSession>(new ChatSession())
  const [currentSession, setCurrentSession] = useState<ChatMessageType[]>([]) 
  const { messages, input, setInput, handleInputChange, setMessages } = useChat({});
  const [loading, setLoading] = useState<boolean>(false)
  const [latestMessage, setLatestMessage] = useState<string>("")
  const [availableF4rmers, setAvailableF4rmers] = useState<F4rmerType[]>([])

  useEffect(() => {
    if(f4rmers) {
      setSelectedAgent(f4rmers[0])
      setAvailableF4rmers(f4rmers)
    }
    else {
      let defaultF4rmers = [
        {
          uid: "default-f4rmer", 
          title: "Default F4rmer", 
          jobDescription: "You are a helpful assistant known as a 'f4rmer' on the 'f4rmhouse' platform. You know how to be helpful and write very nicely formatted markdown answers to user prompts. Users asking you questions will be able to give you tools to make you even more useful. Always reason through step by step when answering complex question if you can't answer some question be sure to remind users that there are tools available on the platform that can help them.", 
          toolbox: [], 
          creator: "", 
          created: "0"
        }
      ]
      setAvailableF4rmers(defaultF4rmers)
      setSelectedAgent(defaultF4rmers[0])
    }
  }, [f4rmers]) 

  useEffect(() => {
    setMessages(chatSession.messages)
  }, [latestMessage, chatSession.messages])

  useEffect(() => {
    chatSession.streaming = false
    setChatSession(chatSession)
  }, [loading])
  
  // Add keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if not in an input field or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Cmd/Ctrl+O to toggle canvas
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        // Toggle between canvas and chat
        setState(state === 'canvas' ? 'chat' : 'canvas');
      }
      
      // Cmd/Ctrl+X to clear chat
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        chatSession.clear();
        setCurrentSession([]);
      }
    };

    // Add event listener for keyboard shortcuts
    window.addEventListener('keydown', handleKeyDown);
    
    // Add event listener for openCanvas custom event
    const handleOpenCanvas = (event: CustomEvent) => {
      // Switch to canvas view when the event is triggered
      setState('canvas');
    };

    // Add event listener for the custom event
    document.addEventListener('openCanvas', handleOpenCanvas as EventListener);
    
    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('openCanvas', handleOpenCanvas as EventListener);
    };
  }, [state, chatSession])

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
      chatSession.push("error", "system", "Connection error. Either the connection to the server has been broken or your connection is not stable. Please come back later and try again.")
    } finally {
      setLoading(false);
    }
  }

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
    if(chatSession.getMessages().length % 4 == 0 && chatSession.getMessages().length != 0 && session.access_token == "undefined") {
      setPromptForUserLogin(true)
    }

    e.preventDefault()
    if (input.length == 0) {
      return
    }
    // TODO: make it so that I need to type nextjsrole and f4role
    chatSession.push("user", "user", input)
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
    if(selectedAgent == null || selectedAgent.title == ""){
      alert("Please select an agent to use.")
      return
    }

    let postData: PostDataType = {
      messages: chatSession.getNextJSMessages(), 
      description: selectedAgent.jobDescription,
      show_intermediate_steps: false,
      email: session.user.email,
      provider: session.provider,
      token: session.access_token,
      f4rmer: selectedAgent.title,
      model: selectedModel
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
    <div className="sm:flex overflow-hidden w-[100vw]">
      <div className={`flex transition-all ${state === "chat" ? "m-auto" : "m-0"}`}>
    <div className={`relative m-auto pt-0 md:pt-0 w-[100vw] h-[100vh] sm:h-[93vh] overflow-hidden ${state === "chat" ? "sm:w-[16cm]" : "sm:w-[10cm]"} ${theme.chatWindowStyle ? theme.chatWindowStyle : ""}`}>
      <div className={`w-full w-[100%] ${theme.textColorSecondary} p-2`}>
        {selectedAgent != undefined ? (
          <AgentSelector f4rmers={availableF4rmers} onAgentSelect={(e:any) => {setSelectedAgent(e)}} selectedF4rmer={selectedAgent}/> 
        ):<></>}
      </div>
      <div className="no-scrollbar flex flex-col w-full transition-all duration-500 overflow-y-auto flex-grow h-full">
        <div
          className={`p-2 no-scrollbar flex flex-col-reverse w-full gap-5 transition-all duration-500 overflow-y-scroll scrollb ${currentSession.length > 0 ? 'opacity-100' : 'opacity-0 h-0'}`}
          ref={messageContainerRef}
        >
          {loading ? 
            <div className="flex gap-2 ml-2"><img className="h-[30px] rounded-full" src="https://pbs.twimg.com/media/CrghjJoUMAEBcO_.jpg"/> <div className={`p-2 ${theme.textColorSecondary}`}><p><span className="">🤔</span> thinking...</p><div className="text-xs"><Timer /></div></div></div>
            :
            <></>
          }
          {chatSession.messages.length > 0 ? (
            [...chatSession.messagesTypes]
              .reverse()
              .map((m, i) => {
                switch (m.role) {
                  case "user":
                    return (<ChatUserMessage key={i} content={m.content} timestamp={m.timestamp}/>)
                  case "tool_init":
                    return (<ChatInitToolCallMessage key={i} message={m.content} debug={chatSession.getDebug(m.id) ?? {message: "no extra information"}}/>)
                  case "system":
                    return (<ChatAIMessage key={i} message={m.content} openCanvas={() => setState("canvas")}/>)
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
        <div className={`mt-auto sticky transition-all ${state === "canvas" ? "w-[98%]" : "w-[99%]"} ml-1 mr-2 ${chatSession.getMessages().length > 0 ? "bottom-[10%] sm:bottom-12 pb-1" : "bottom-[calc(50vh)]"}`}>
            <div className={`${chatSession.getMessages().length === 0 ? "opacity-100" : "opacity-0"} pb-5`}>
              <h1 className={`text-2xl ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}>{config.welcomeText.replace("{{username}}", session.user.name === "undefined" ? "anon" : session.user.name.split(" ")[0])}</h1>
            </div>
          <UserInput onSubmit={sendMessage} onChange={handleInputChange} value={input}>
            <div className="flex p-0">
              <ModelSelector onModelSelect={(e:any) => {setSelectedModel(e)}} selectedModel={selectedModel}/>
              <button onClick={() => setState(state === "canvas" ? "chat" : "canvas")} className={`transition-all p-2 ${theme.textColorSecondary ? theme.textColorSecondary : "text-neutral-300"} hover:${theme.secondaryHoverColor ? theme.secondaryHoverColor : ""}`}>
                {state === "canvas" ? <ArrowRightToLine size={15}/> : <ArrowLeftToLine size={15}/>}
              </button>
            </div>
          </UserInput>
        </div>
      </div>
    </div>
    <div className="absolute bg-transparent sm:static ml-2 right-2 top-[40%]">
      <div className={`flex flex-col gap-2 ${chatSession.getMessages().length == 0 ? "opacity-0" : "opacity-100"}`}>
        <button onClick={() => {chatSession.clear();setCurrentSession([])}} className={`transition-all hover:rotate-[-90deg] rounded-md p-2 ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}><RotateCcw size={15}/></button>
      </div> 
    </div>
    {promptForUserLogin ? 
      <div onClick={() => setPromptForUserLogin(false)} className={`${promptForUserLogin ? "" : "hidden"} transition-all absolute top-0 left-0 w-full h-full bg-black bg-opacity-50`}>
        <Modal open={promptForUserLogin} title="🙏">
          <div className="p-5">
            <p className="text-2xl font-bold">Appreciate you for using f4rmhouse.</p>
            <p className="text-neutral-400">Sign in and add actions to your LLM to automate your digital work!</p>
            <div className="w-full flex">
              <Link href="/login" className="transition-all hover:bg-neutral-400 bg-neutral-200 mt-5 pt-2 pb-2 w-full rounded-full text-black text-center">Sign in</Link>
            </div>
            <button onClick={() => {setPromptForUserLogin(false)}} className="z-99 text-sm text-center text-neutral-300 pt-2 w-full underline">not yet!</button>
          </div>
        </Modal>
      </div>
      :
      <></>
    }
    </div>
    <div className={`flex transition-all ease-in-out text-white rounded-md w-full bg-white ${state === "chat" ? "opacity-0 hidden" : "opacity-100"}`}>
      <Canvas />
    </div>
    </div>
  )
}