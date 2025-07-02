import { useState, useEffect } from "react";
import { CirclePlus, Hammer } from "lucide-react";
import { useArtifact } from "../../../context/ArtifactContext";
import { useTheme } from "../../../context/ThemeContext";

export default function RemoteToolResponse({message, debug}:{message:string | undefined, debug: any}) {
  const [showMore, setShowMore] = useState<boolean>(false)
  const { theme } = useTheme();
  const { addArtifact } = useArtifact()
  
  // Function to extract URLs from a string
  const extractUrls = (text: string): string[] => {
    // Regular expression to match URLs
    // This pattern matches common URL formats including http, https, ftp protocols
    const urlRegex = /(?:https?|ftp):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gi;
    
    // Extract all URLs from the text
    return text.match(urlRegex) || [];
  }
  
  // Check if debug.kwargs.content contains a URL, extract it, and set it as the current artifact
  useEffect(() => {
    //if (debug?.kwargs.content && typeof debug.kwargs.content === 'string') {
    //  const urls = extractUrls(debug.kwargs.content);
    //  
    //  if (urls.length > 0) {
    //    // Use the first URL found in the content
    //    const url = urls[0];
    //    
    //    // Set the URL as the current artifact
    //    addArtifact(url)
    //    
    //    // Dispatch a custom event to open the canvas
    //    const event = new CustomEvent('openCanvas', { detail: { url } });
    //    document.dispatchEvent(event);
    //  }
    //}
  }, [addArtifact])

  return (
    <div className="">
      <div onClick={() => setShowMore(p => !p)} className={`group flex ${theme.secondaryColor} rounded-md p-2 shadow hover:${theme.primaryColor} cursor-pointer`}>
        <button className={`group-hover:rotate-45 transition-all rounded ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`} onClick={() => setShowMore(p => !p)}>
          <Hammer size={15}/>
        </button>
        <p className={`mt-auto ml-2 text-xs ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}>Action response </p>
      </div>
      <div className='w-full'>
          <div className="w-full">
          {
            showMore ?
            <div className="">
              <div className="block w-full text-neutral-400 text-xs font-mono">{<div><pre>{JSON.stringify(debug, null, 2) }</pre></div>}</div>
              <button className={`flex ${theme.secondaryColor} rounded w-[100%] text-neutral-400 p-1`} onClick={() => setShowMore(p => !p)}>
              <Hammer size={15}/>
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