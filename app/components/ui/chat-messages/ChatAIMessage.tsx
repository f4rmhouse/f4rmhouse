import { useEffect, useState, useRef } from "react";
import { Timer } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext"
import { useArtifact } from "../../../context/ArtifactContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';
import { MermaidDiagram } from '@lightenna/react-mermaid-diagram';

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
  const [hasCreatedHtmlArtifact, setHasCreatedHtmlArtifact] = useState(false);
  const [hasCreatedHtmlUrlArtifact, setHasCreatedHtmlUrlArtifact] = useState(false);
  const [hasCreatedImageArtifact, setHasCreatedImageArtifact] = useState(false);

  // Function to extract HTML content between DOCTYPE and closing html tags
  const extractHTMLContent = (text: string): string | null => {
    if (!text) return null;
    
    // Regular expression to match from <!DOCTYPE html> or <html> to </html>
    // The 's' flag makes . match newlines as well
    const htmlRegex = /(?:<!DOCTYPE\s+html[^>]*>[\s\S]*?|<html[^>]*>[\s\S]*?)<\/html>/gi;
    const match = text.match(htmlRegex);
    
    return match ? match[0] : null;
  };

  // Function to extract HTML file URLs from message content
  const extractHtmlUrls = (text: string): string[] => {
    if (!text) return [];
    
    // Regular expressions for HTML file URL patterns
    const patterns = [
      // Direct HTML file URLs (http/https with .html/.htm extensions)
      /https?:\/\/[^\s<>"']+\.(?:html|htm)(?:\?[^\s<>"']*)?/gi,
      // Markdown link syntax [text](url.html)
      /\[[^\]]*\]\(([^)]+\.(?:html|htm)(?:\?[^)]*)?)\)/gi,
      // HTML anchor tags with href to HTML files
      /<a[^>]+href=["']([^"']+\.(?:html|htm)(?:\?[^"']*)?)["'][^>]*>/gi
    ];
    
    const htmlUrls: string[] = [];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        // For markdown and HTML patterns, extract the URL from capture group
        const url = match[1] || match[0];
        if (url && !htmlUrls.includes(url)) {
          htmlUrls.push(url);
        }
      }
    });
    
    return htmlUrls;
  };

  // Function to extract image URLs from message content
  const extractImageUrls = (text: string): string[] => {
    if (!text) return [];
    
    // Regular expressions for different image URL patterns
    const patterns = [
      // Direct image URLs (http/https with common image extensions)
      /https?:\/\/[^\s<>"']+\.(?:jpg|jpeg|png|gif|bmp|webp|svg|ico|tiff|tif)(?:\?[^\s<>"']*)?/gi,
      // Markdown image syntax ![alt](url)
      /!\[[^\]]*\]\(([^)]+\.(?:jpg|jpeg|png|gif|bmp|webp|svg|ico|tiff|tif)(?:\?[^)]*)?)\)/gi,
      // HTML img tags
      /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|gif|bmp|webp|svg|ico|tiff|tif)(?:\?[^"']*)?)["'][^>]*>/gi
    ];
    
    const imageUrls: string[] = [];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        // For markdown and HTML patterns, extract the URL from capture group
        const url = match[1] || match[0];
        if (url && !imageUrls.includes(url)) {
          imageUrls.push(url);
        }
      }
    });
    
    return imageUrls;
  };

  // Create artifact when HTML content is detected
  useEffect(() => {
    if (message?.includes("!DOCTYPE html") && message?.includes("</html>") && !hasCreatedHtmlArtifact) {
      const htmlContent = extractHTMLContent(message);
      if (htmlContent) {
        addArtifact(htmlContent);
        setHasCreatedHtmlArtifact(true);
      }
    }
  }, [message, hasCreatedHtmlArtifact, addArtifact]);

  // Create artifacts for HTML file URLs
  useEffect(() => {
    if (message && !hasCreatedHtmlUrlArtifact) {
      const htmlUrls = extractHtmlUrls(message);
      if (htmlUrls.length > 0) {
        htmlUrls.forEach(url => {
          addArtifact(url);
        });
        setHasCreatedHtmlUrlArtifact(true);
      }
    }
  }, [message, hasCreatedHtmlUrlArtifact, addArtifact]);

  // Create artifacts for image URLs
  useEffect(() => {
    if (message && !hasCreatedImageArtifact) {
      const imageUrls = extractImageUrls(message);
      if (imageUrls.length > 0) {
        imageUrls.forEach(url => {
          addArtifact(url);
        });
        setHasCreatedImageArtifact(true);
      }
    }
  }, [message, hasCreatedImageArtifact, addArtifact]);

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