"use client"
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useTheme } from "@/app/context/ThemeContext"
import { useAgent } from '@/app/context/AgentContext'
import F4Session from "../../types/F4Session";
import { 
  ArrowDown,
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  CircleStop, 
  CornerRightUp, 
  Paperclip, 
  Pencil, 
  RotateCcw 
} from "lucide-react";
import F4rmerEditor from "./F4rmerEditor";
import Link from "next/link";
import Modal from "../modal/Modal";
import UserInput from "./UserInput";
import ModelSelector from "./ModelSelector";
import AgentSelector from "./AgentSelector";
import config from "../../../../f4.config";
import Canvas from "./Canvas";
import { PostDataType } from "./utils/types";
import StreamProcessor from "./utils/StreamProcessor";
import F4rmerType from "../../types/F4rmerType";
import MessageRenderer from "./MessageRenderer";
import { useKeyboardShortcuts } from "../../../utils/keyboardShortcuts";
import { useChatSession } from "./hooks/useChatSession";
import { useLoadingState } from "./hooks/useLoadingState";
import { MessageHandlers } from "./utils/messageHandlers";
import { helpContent } from '../../../docs/commands/help';
import Timer from "../misc/Timer";

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
export default function PromptBox({session, state, setState, f4rmers, addTab}: {session: F4Session, state: "canvas" | "chat" | "preview" | "edit", setState: (state: "canvas" | "chat" | "preview" | "edit") => void, f4rmers: F4rmerType[], addTab: () => void}) {
  const { theme } = useTheme();
  const { selectedAgent, setSelectedAgent, setAvailableAgents, client } = useAgent();
  
  // Custom hooks for state management
  const {
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
  } = useChatSession();
  
  const { loading, setLoading, currentLoadingMessage } = useLoadingState();
  
  // Component state
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [promptForUserLogin, setPromptForUserLogin] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<any>(config.models[Object.keys(config.models)[0]][0]);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [isScrollable, setIsScrollable] = useState<boolean>(false);

  useEffect(() => {
    setWelcomeMessage(config.welcomeText[Math.floor(Math.random() * config.welcomeText.length)].replace("{{username}}", session.user.name === "undefined" ? "anon" : session.user.name.split(" ")[0]))
    if(f4rmers && f4rmers.length > 0) {
      setAvailableAgents(f4rmers)
    }
  }, [session])

  // Scroll detection effect
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const checkScrollState = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 10; // Small threshold for better UX
      
      // Check if content is scrollable
      const contentScrollable = scrollHeight > clientHeight;
      setIsScrollable(contentScrollable);
      
      if (!contentScrollable) {
        setIsAtTop(true);
        setIsAtBottom(true);
        return;
      }
      
      // Check scroll position
      const atTop = scrollTop <= threshold;
      const atBottom = scrollTop >= scrollHeight - clientHeight - threshold;
      
      setIsAtTop(atTop);
      setIsAtBottom(atBottom);
    };

    // Initial check
    checkScrollState();
    
    // Add scroll listener
    container.addEventListener('scroll', checkScrollState);
    
    // Also check when content changes (new messages)
    const resizeObserver = new ResizeObserver(checkScrollState);
    resizeObserver.observe(container);
    
    return () => {
      container.removeEventListener('scroll', checkScrollState);
      resizeObserver.disconnect();
    };
  }, [chatSession.messages]);

  useEffect(() => {
    setMessages(chatSession.messages)
  }, [latestMessage, chatSession.messages])

  useEffect(() => {
    chatSession.streaming = false
    setChatSession(chatSession)
  }, [loading])

  // Message handlers
  const messageHandlers = new MessageHandlers(
    chatSession,
    selectedAgent || null,
    selectedModel,
    session,
    client,
    processStream,
    setLoading,
    updateLatestMessage,
    setChatSession,
    setCurrentSession,
    setSelectedAgent,
    setState
  );

  // Keyboard shortcuts
  const { registerShortcuts, cleanup } = useKeyboardShortcuts({
    TOGGLE_CANVAS: {
      key: 'o',
      metaKey: true,
      preventDefault: true,
      callback: () => setState(state === 'canvas' ? 'chat' : 'canvas'),
    },
    CLEAR_CHAT: {
      key: 'x',
      metaKey: true,
      preventDefault: true,
      callback: clearChat,
    },
  });

  useEffect(() => {
    registerShortcuts();
    return cleanup;
  }, [state]);

  // Scroll position monitoring
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const threshold = 0;
    const isNearTop = container.scrollTop < threshold;

    if (isNearTop) {
      container.scrollTop = 0; // scroll to top (which is actually bottom of flex-col-reverse)
    }
  }, [chatSession.getMessages().length]);

  // Scroll to top function
  const scrollToTop = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

   /**
   * stopStream cancels the current streaming operation
   */
   const stopStream = () => {
    if (currentReaderRef.current) {
      currentReaderRef.current.cancel();
      currentReaderRef.current = null;
      setLoading(false);
    }
  };

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
      let buffer = ''
      let decoder = new TextDecoder()
      while (true) {
        id++
        const { done, value } = await reader.read();
  
        if (done) break;

        buffer += decoder.decode(value, {stream: true});
        const lines = buffer.split("\n")
        buffer = lines.pop()!
        for (const line of lines) {
          StreamProcessor.processTokenChunk(line, chatSession, MSStart, updateLatestMessage, loading)
        }
      }
    } catch (err) {
      console.error(err)
      chatSession.push("error", "system", "Connection error. Either the connection to the server has been broken or your connection is not stable. Please come back later and try again.", 0)
    } finally {
      setLoading(false);
      currentReaderRef.current = null;
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
    chatSession.push("user", "user", input, 0)
    setInput("")

    // Add session to the components chat message storage
    setCurrentSession(chatSession.getMessages())

    // Hopefully we can remove messages in the future
    setMessages(chatSession.toNextJSMessage("user"))

    // show loading animation
    setLoading(true)

    if(selectedModel == null){
      alert("Please select a model to use.")
      return
    }
    if(selectedAgent == null || selectedAgent.title == ""){
      alert("Please select an agent to use.")
      return
    }

    if(input.startsWith("/help")) {
      chatSession.push("system", "system", helpContent, 0)
      setInput("")
      setLoading(false)
      return
    }

    if(input.startsWith("/clear")) {
      setInput("")
      setLoading(false)
      clearChat()
      return
    }
    
    if(input.startsWith("/tab")) {
      addTab()
      setLoading(false)
      return
    }

    // Start latency measure when we prepeare the prompt
    let MSStart = new Date().getTime()

    let tools = await client.preparePrompt()

    let postData: PostDataType = {
      messages: chatSession.getNextJSMessages(), 
      description: selectedAgent.jobDescription,
      show_intermediate_steps: false,
      session: session,
      f4rmer: selectedAgent.title,
      model: selectedModel,
      tools: tools,
      allowList: []
    }

    // Send message
    const stream = await chatSession.send(postData)
    if(!stream) {
      alert("There was a server error while sending your request. This is completely our, fault we will do better in the future.")
      return
    }

    // Store the reader reference for potential cancellation
    currentReaderRef.current = stream
    await processStream(chatSession.getMessages().length, stream, MSStart) 
  }

  return (
    <div className="sm:flex w-[100vw]">
      <div className={`flex transition-all ${state === "canvas" ? "m-0" : "m-auto"}`}>
        <div className={`relative m-auto mt-1 md:pt-0 w-[100vw] h-[100vh] sm:h-[93vh] ${state === "chat" || state === "edit" ? "sm:w-[16cm]" : "sm:w-[10cm]"} rounded-md ${theme.chatWindowStyle ? theme.chatWindowStyle : ""}`}>
          <div className="flex flex-col w-full transition-all duration-500 flex-grow h-full">
            <div
              className={`overflow-auto scrollbar-hide p-2 flex flex-col w-full gap-5 transition-all duration-500 ${currentSession.length > 0 ? 'opacity-100' : 'opacity-0 h-0'}`}
              ref={messageContainerRef}
            >
              {chatSession.messagesTypes.length > 0 ? (
                <MessageRenderer
                  messages={chatSession.messagesTypes}
                  chatSession={chatSession}
                  onAuthenticate={messageHandlers.authenticateMessage}
                  onCancel={messageHandlers.cancelMessage}
                />
              ) : (
                <></>
              )}
              {loading ? (
                <div className="flex gap-2 ml-2">
                  <img className="h-[30px] rounded-full" src="https://pbs.twimg.com/media/CrghjJoUMAEBcO_.jpg" />
                  <div className={`p-2 ${theme.textColorSecondary}`}>
                    <p className="">
                      <span className=""></span>
                      {currentLoadingMessage}
                    </p>
                    <div className="text-xs">
                      <Timer />
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
        </div>
        <div className={`mt-auto sticky transition-all ${state === "canvas" ? "w-[98%]" : "w-[99%]"} ml-1 mr-2 ${chatSession.getMessages().length > 0 ? "bottom-[10%] sm:bottom-0 pb-1" : "bottom-[calc(40vh)]"}`}>
          {/* Scroll buttons - only show when scrolling is available */}
          {isScrollable && chatSession.getMessages().length > 0 && (
            <div className="flex absolute bottom-10 right-0">
              {/* Scroll to bottom button - only show when not at bottom */}
              {!isAtBottom && (
                <div className="flex w-full mb-2">
                  <button 
                    onClick={scrollToBottom}
                    className={`${theme.textColorSecondary ? theme.textColorSecondary : "text-neutral-300"} m-auto p-2 rounded-full hover:scale-110 transition-all duration-200`}
                    title="Scroll to bottom"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              )}
              {/* Scroll to top button - only show when not at top */}
              {!isAtTop && (
                <div className="flex w-full mb-2">
                  <button 
                    onClick={scrollToTop}
                    className={`${theme.textColorSecondary ? theme.textColorSecondary : "text-neutral-300"} m-auto p-2 rounded-full hover:scale-110 transition-all duration-200`}
                    title="Scroll to top"
                  >
                    <ArrowUp size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
          <div className={`${chatSession.getMessages().length === 0 ? "block" : "hidden"} pb-1`}>
            <h1 className={`flex text-2xl ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}>{welcomeMessage} <img className="my-auto w-10" src={"https://media.tenor.com/R7JF4cuIjogAAAAj/spongebob-spongebob-meme.gif"} /></h1>
          </div>
          <UserInput onSubmit={sendMessage} onChange={handleInputChange} value={input}>
            <div className="flex p-0">
              <AgentSelector />
              <ModelSelector onModelSelect={(e:any) => {setSelectedModel(e)}} selectedModel={selectedModel}/>
              <button className={`hover:${theme.secondaryColor} rounded-md transition-all p-0 px-3 ${theme.textColorSecondary ? theme.textColorSecondary : "text-neutral-300"}`}>
                <Paperclip size={14}/>
              </button>
              <>
              {state == "canvas" ?
              <button onClick={() => {setState("chat")}} className={`ml-auto rounded-md transition-all px-3 ${theme.textColorSecondary ? theme.textColorSecondary : "text-neutral-300"}`}>
                <span className=""><ArrowRight size={15}/></span>
              </button>
              :
              <button onClick={() => setState("canvas")} className={`ml-auto rounded-md transition-all px-3 ${theme.textColorSecondary ? theme.textColorSecondary : "text-neutral-300"}`}>
                <span className=""><ArrowLeft size={15}/></span>
              </button>
              }
              </>
              {!loading ?
              <button type="submit" className={`ml-auto rounded-md transition-all px-3 ${theme.accentColor}`}>
                <span className=""><CornerRightUp size={15}/></span>
              </button>
              :
              <button type="button" onClick={stopStream} className={`ml-auto rounded-md transition-all px-3`}>
                <span className="text-red-500"><CircleStop size={25} /></span>
              </button>
              }
            </div>
          </UserInput>
        </div>
      </div>
    </div>
    <div className="absolute bg-transparent sm:static ml-2 right-2 top-[40%]">
      <button onClick={() => state === "edit" ? setState("chat") : setState("edit")} className={`transition-all hover:rotate-[90deg] rounded-md p-2 ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}><Pencil size={15}/></button>
      <div>
        <AgentSelector />
      </div>
      <div>
        <ModelSelector onModelSelect={(e:any) => {setSelectedModel(e)}} selectedModel={selectedModel}/>
      </div>
      <div className={`flex flex-col gap-2 ${chatSession.getMessages().length == 0 ? "opacity-0" : "opacity-100"}`}>
        <button onClick={clearChat} className={`transition-all hover:rotate-[-90deg] rounded-md p-2 ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}><RotateCcw size={15}/></button>
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
    <div className={`flex transition-all ease-in-out rounded-md bg-transparent w-[65%] ${state !== "canvas" ? "opacity-0 hidden" : "opacity-100"}`}>
      <Canvas />
    </div>
    <F4rmerEditor 
      f4rmer={selectedAgent} 
      isVisible={state === "edit"}
      onClose={() => setState("chat")}
      onSave={messageHandlers.updateF4rmer}
    />
    </div>
  )
}