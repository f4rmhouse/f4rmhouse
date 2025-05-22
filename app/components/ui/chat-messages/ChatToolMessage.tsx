import { useState, useEffect } from "react";
import { LangchainMessageType } from "../../types/LangchainMessageType";
import { CirclePlus } from "lucide-react";
import { ToolMessageType } from "../../types/ToolMessageType";
import { useArtifact } from "../../../context/ArtifactContext";

export default function RemoteToolResponse({message, debug}:{message:string | undefined, debug: any}) {
  const [showMore, setShowMore] = useState<boolean>(false)
  const { addArtifact, setCurrentArtifact } = useArtifact()
  
  // Function to extract URLs from a string
  const extractUrls = (text: string): string[] => {
    // Regular expression to match URLs
    // This pattern matches common URL formats including http, https, ftp protocols
    const urlRegex = /(?:https?|ftp):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gi;
    
    // Extract all URLs from the text
    return text.match(urlRegex) || [];
  }
  
  // Check if debug.content contains a URL, extract it, and set it as the current artifact
  useEffect(() => {
    console.log("DEBUG: ", debug.kwargs.content)
    if (debug?.kwargs.content && typeof debug.kwargs.content === 'string') {
      const urls = extractUrls(debug.kwargs.content);
      
      if (urls.length > 0) {
        // Use the first URL found in the content
        const url = urls[0];
        
        // Set the URL as the current artifact
        console.log("DEBUG: ", url)
        setCurrentArtifact(url);
        
        // Dispatch a custom event to open the canvas
        const event = new CustomEvent('openCanvas', { detail: { url } });
        document.dispatchEvent(event);
      }
    }
  }, [debug?.content])
  return (
    <div className="">
      <div className="flex">
        <button className="bg-neutral-900 rounded text-neutral-400" onClick={() => setShowMore(p => !p)}>
          <CirclePlus size={15}/>
        </button>
        <p className="mt-auto ml-2 text-xs font-mono text-green-400">Action response </p>
      </div>
      <div className=''>
          <div className="w-full">
          {
            showMore ?
            <div className="w-full">
              <div className="block w-full text-neutral-400 text-xs font-mono">{<div><pre>{JSON.stringify(debug, null, 2) }</pre></div>}</div>
              <button className="flex bg-neutral-900 rounded w-[100%] text-neutral-400 p-1" onClick={() => setShowMore(p => !p)}>
              <CirclePlus size={15}/>
              <p className="text-xs font-mono bg-neutral-900 ml-2">{String("hide")}</p>
              </button>
            </div>
            :
            <></>
          }
          </div>
      </div>
    </div>
  )
}