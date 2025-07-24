import { useEffect, useState, useRef } from "react";
import { Timer } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext"
import { useArtifact } from "../../../context/ArtifactContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';
import { MermaidDiagram } from '@lightenna/react-mermaid-diagram';

// Function to extract Mermaid charts from message content
const extractMermaidCharts = (text: string) => {
  const mermaidRegex = /```mermaid\s*\n([\s\S]*?)\n```/g;
  const charts: { chart: string; index: number }[] = [];
  let match;
  
  while ((match = mermaidRegex.exec(text)) !== null) {
    charts.push({
      chart: match[1].trim(),
      index: match.index
    });
  }
  
  return charts;
};

// Function to split message content around Mermaid charts
const splitMessageWithCharts = (text: string) => {
  const mermaidRegex = /```mermaid\s*\n[\s\S]*?\n```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = mermaidRegex.exec(text)) !== null) {
    // Add text before the chart
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }
    
    // Add the chart
    const chartContent = match[0].replace(/```mermaid\s*\n/, '').replace(/\n```$/, '').trim();
    parts.push({
      type: 'mermaid',
      content: chartContent
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after the last chart
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }
  
  // If no charts found, return the original text
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: text
    });
  }
  
  return parts;
};

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
                {message && splitMessageWithCharts(message).map((part, index) => {
                  if (part.type === 'mermaid') {
                    return (
                      <div key={index} className="my-4 p-4 border rounded-lg" style={{backgroundColor: theme.hoverColor || 'transparent'}}>
                        <MermaidDiagram>{part.content}</MermaidDiagram>
                      </div>
                    );
                  } else if (part.content.trim()) {
                    return (
                      <div key={index}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.content}</ReactMarkdown>
                      </div>
                    );
                  }
                  return null;
                })}
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