"use client"

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import User from "@/app/microstore/User";
import F4rmerType from "@/app/components/types/F4rmerType";
import Link from "next/link";
import config from "@/f4.config";
import { LineNumberedTextarea } from "@/app/components/ui/LineNumberedTextarea";
import ModelSelector from "@/app/components/ui/chat-window/ModelSelector";
import { Sparkles } from "lucide-react";
import PromptBoxSimple from "@/app/components/ui/chat-window/PromptBoxSimple";
import ErrorModal from "@/app/components/ui/modal/ErrorModal";

const SYS_PROMPT = `**System Prompt for AI Agent**

---

**Role:** You are an advanced AI assistant designed to generate insightful, relevant, and contextually appropriate content based on user inputs. Your primary goal is to provide helpful information, creative suggestions, or tailored responses that align with the user's needs and preferences. 

**Capabilities:**
1. **Understanding Context:** Analyze the user's input to grasp the underlying purpose and context, allowing you to generate responses that are not only accurate but also meaningful.
2. **Content Generation:** Create text outputs that can range from informative articles, creative writing, and suggestions to problem-solving responses, depending on the user's request.
3. **Adaptability:** Adjust your tone and style based on the user's input. Whether they require a formal response or a casual conversation, match their expectations to enhance the interaction.
4. **Clarification and Expansion:** If the user's input is vague or unclear, proactively ask clarifying questions or provide examples to refine the output, ensuring the final response is as useful as possible.

**Instructions:**
- Begin by fully interpreting the user’s input. Consider any implicit requests or nuances.
- Generate an output that fulfills the user’s needs while providing additional value, such as suggestions, relevant examples, or further questions that may aid in the conversation.
- Maintain a friendly, engaging tone throughout the interaction to foster a positive experience for the user.
- If appropriate, offer follow-up options or additional resources to help the user explore the topic further.

**Example Interaction:**
User: "Can you help me plan a surprise birthday party?"
AI: "Absolutely! To get started, how many guests are you thinking of inviting? Do you have a specific theme or location in mind? Additionally, would you like suggestions for activities and food?"

---

Use this prompt to guide your responses effectively, ensuring that each interaction is productive and tailored to the user’s specific needs.`

/**
 * CreateF4rmerForm is a form that allows a user to create a new f4rmer. User inputs name, description and
 * toolbox of f4rmer
 * @returns 
 */
export default function CreateF4rmerForm() {
  const router = useRouter()
  const { data: session } = useSession();

  const [selectedModel, setSelectedModel] = useState<any>(config.models[Object.keys(config.models)[0]][0]);
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [name, setName] = useState<string>("")
  const [systemPrompt, setSystemPrompt] = useState<string>("")
  const [shortDescription, setShortDescription] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // 768px is Tailwind's md breakpoint
      setIsMobile(window.innerWidth < 768);
    }

    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures effect is only run on mount

  const submit = (e:any) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    let name = formData.get("name")
    let job_description = formData.get("name")

    if (!name?.toString() || !job_description?.toString()){
      return
    }
    
    else if (session != null && session != undefined && session.user != null && session.user != undefined && session?.user) {
      // @ts-expect-error
      const user = new User(String(session.user.email), String(session.provider), String(session.access_token));
      let f4rmer:F4rmerType = {
        uid: "",
        title: String(formData.get("name")), 
        jobDescription: String(formData.get("job_description")), 
        toolbox: [],
        creator: "",
        created: ""
      } 
      user.createF4rmer(f4rmer).then(e => router.push("/"))
  }
  }

  const autoGenerateSysPrompt = async () => {
    if (name === "") {
      alert("Please provide more information about your agent.")
      return
    }
    const response = await fetch('/api/llm/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: SYS_PROMPT,
        messages: ['Generate a system prompt to a useful AI agent called ' + name + ' with short description: "' + shortDescription + '" (ignore it if it is empty)'],
        model: { "id": "claude-sonnet-4-20250514", "name": "Claude 4 Sonnet", "provider": "anthropic"},
      })
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    let fullResponse = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Convert the chunk to text and accumulate it
      const text = new TextDecoder().decode(value);
      fullResponse += text;
      setSystemPrompt(fullResponse);
    }
  }

  const createAgent = () => {
    setShowPreview(false)
    
    // Validate form fields
    if (!name.trim()) {
      setErrorMessage("Please provide a name for your agent")
      setShowErrorModal(true)
      return
    }
    
    if (!systemPrompt.trim()) {
      setErrorMessage("Please provide a system prompt for your agent")
      setShowErrorModal(true)
      return
    }
    
    if(session && session.user) {
      if(session.user.email == null || session.user.email == undefined) {
        setErrorMessage("User email is not available")
        setShowErrorModal(true)
        return
      }
      
      // Tell TypeScript to ignore the potential error with session.provider because it does
      // not undersand how session works
      // @ts-expect-error - Session includes provider property from auth context
      let user = new User(session.user.email, session.provider, session.access_token)
      
      // Create the f4rmer object
      let f4rmer: F4rmerType = {
        uid: "uid",
        title: name, 
        jobDescription: systemPrompt, 
        toolbox: [],
        creator: session.user.email,
        created: new Date().toISOString()
      }
      
      // Create the f4rmer and redirect to home on success
      user.createF4rmer(f4rmer)
        .then(() => router.push("/"))
        .catch(err => {
          console.error("Error creating agent:", err)
          let errorMsg = "Failed to create agent"
          
          // Try to extract more specific error message if available
          if (err.response && err.response.data && err.response.data.message) {
            errorMsg = "There was a server error when trying to create your agent. Please try again later. Error: " + err.response.data.message
          } else if (typeof err.message === 'string') {
            errorMsg = "There was a server error when trying to create your agent. Please try again later. Error: " + err.message
          }
          
          setErrorMessage(errorMsg)
          setShowErrorModal(true)
        })
    } else {
      setErrorMessage("You must be logged in to create an agent")
      setShowErrorModal(true)
    }
  }

  return(
    <div className="w-full ml-10">
      {isMobile ?
      <div className="flex w-full h-[100vh]">
        <div className="text-center p-4 m-auto">
          <h2 className="text-xl font-semibold text-neutral-100 mb-2">Not Available on Mobile</h2>
          <p className="text-neutral-400">Agent creation is only available on larger screens</p>
        </div>
      </div>
      :
      <div className={`flex w-[90vw] m-auto lg:w-[90vw] p-3`}>
      <div className="w-full">
      <div className="flex items-center gap-2 mt-10">
        <Link href="/" className="hover:opacity-80 transition-all">
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-100">Add Agent</h1>
      </div>
      <div className="w-full bg-neutral-900/50 rounded-lg p-6">
        <form onSubmit={(e) => submit(e)} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">Name</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 ${config.theme.primaryColor ?? "bg-neutral-800/50"} border ${config.theme.secondaryColor.replace("bg-", "border-") ?? "border-neutral-800"} rounded-md transition-all`}
              placeholder="Enter agent name" 
              name="name" 
              type="text"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">Short description</label>
            <input 
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className={`w-full px-4 py-2 ${config.theme.primaryColor ?? "bg-neutral-800/50"} border ${config.theme.secondaryColor.replace("bg-", "border-") ?? "border-neutral-800"} rounded-md transition-all`}
              placeholder="Enter short description (optional)" 
              name="short description" 
              type="text"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">System prompt</label>
            <LineNumberedTextarea
              className={`px-4 py-2 ${config.theme.primaryColor ?? "bg-neutral-800/50"} border ${config.theme.secondaryColor.replace("bg-", "border-") ?? "border-neutral-800"} rounded-md transition-all min-h-[120px]`}
              name="job_description" 
              placeholder="Describe the agent's primary task and responsibilities..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
            <div className="flex justify-end">
              <button onClick={(e) => {e.preventDefault(); autoGenerateSysPrompt()}} className="flex text-neutral-400 hover:text-white transition-all cursor-pointer">
                <p className="text-xs my-auto mr-2">Autogenerate</p>
                <Sparkles size={20} />
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-400">Preferred model</label>
            <ModelSelector onModelSelect={(model) => setSelectedModel(model)} selectedModel={selectedModel}/>
          </div>
          <div className="flex gap-2">
            <button 
              className={`cursor-pointer transition-all ${config.theme.accentColor ?? "bg-neutral-500"} hover:${config.theme.hoverColor ?? "bg-neutral-600"} py-2 px-6 rounded-md ml-auto font-medium text-sm`}
              onClick={(e) => {e.preventDefault(); setShowPreview(p => !p)}}
            >
              Preview Agent
            </button>
          </div>
        </form>
      </div>
      </div>
      <div className={`bg-neutral-900/50 rounded-lg w-[100%] mt-10 ${showPreview ? "block" : "hidden"}`}>
        <div className="bg-neutral-900/50 rounded-lg w-[100%]">
          <PromptBoxSimple uti={name} description={systemPrompt}/>
        </div>
        <div className="flex gap-2 align-end justify-end pt-2">
        <button onClick={() => setShowPreview(false)} className="cursor-pointer transition-all hover:opacity-80 rounded-md font-medium text-sm bg-neutral-800 py-2 px-6">Close preview</button>
        <button 
          className={`cursor-pointer transition-all ${config.theme.accentColor ?? "bg-neutral-500"} hover:${config.theme.hoverColor ?? "bg-neutral-600"} py-2 px-6 rounded-md font-medium text-sm`}
          onClick={() => createAgent()}
        >
          Create Agent
        </button>
        </div>
      </div>
    </div>
    }
    
    {/* Error Modal */}
    <ErrorModal 
      open={showErrorModal} 
      setIsOpen={setShowErrorModal} 
      title="Error Creating Agent" 
      content={errorMessage} 
    />
    </div>
  )
}