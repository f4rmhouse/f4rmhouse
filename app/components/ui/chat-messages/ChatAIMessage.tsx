import { useEffect, useState, useRef } from "react";
import { Timer } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext"
import { useArtifact } from "../../../context/ArtifactContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';

export default function NewAIMessage({id, message, latency}:{id: string, message:string| undefined, latency: number}) {
  const { theme } = useTheme();
  const { addArtifact } = useArtifact();
  const [hasCreatedArtifact, setHasCreatedArtifact] = useState(false);

  // Function to extract HTML content between DOCTYPE and closing html tags
  const extractHTMLContent = (text: string): string | null => {
    if (!text) return null;
    
    // Regular expression to match from <!DOCTYPE html> to </html>
    // The 's' flag makes . match newlines as well
    const htmlRegex = /<!DOCTYPE\s+html[^>]*>[\s\S]*?<\/html>/gi;
    const match = text.match(htmlRegex);
    
    return match ? match[0] : null;
  };

  // Create artifact when HTML content is detected
  useEffect(() => {
    if (message?.includes("!DOCTYPE html") && message?.includes("</html>") && !hasCreatedArtifact) {
      const htmlContent = extractHTMLContent(message);
      if (htmlContent) {
        addArtifact(htmlContent);
        setHasCreatedArtifact(true);
      }
    }
  }, [message, hasCreatedArtifact]);

  return (
    <>
    {message &&
    <div className="relative group flex gap-2 w-full text-black font-base">
      <img className="h-[30px] rounded-full" src="https://pbs.twimg.com/media/CrghjJoUMAEBcO_.jpg"/> 
      <div className='rounded-2xl rounded-tl-sm w-[92%]'>
          <div>
            <div className={`${theme.textColorPrimary} ${theme.aiMessageStyle ? theme.aiMessageStyle : "bg-transparent"} rounded-lg`}>
              <div className="markdown-content m-0" style={{backgroundColor: 'inherit', padding:0}}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message}</ReactMarkdown>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 group-hover:opacity-100 opacity-0 text-xs text-black w-full">
            <div className="flex">
              <Timer size={15}/>
              <p className="ml-1">{(latency / 1000).toFixed(2)}s</p>
            </div>
          </div>
      </div>
    </div>
    }
    </>
  )
}