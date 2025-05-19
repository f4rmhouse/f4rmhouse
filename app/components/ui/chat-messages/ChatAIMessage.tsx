import { useState } from "react";
import { LangchainMessageType } from "../../types/LangchainMessageType";
import { CirclePlus, Timer } from "lucide-react";
import { remark } from "remark";
import html from 'remark-html';
import config from "../../../../f4.config"
import { useArtifact } from "../../../context/ArtifactContext"
import { useTheme } from "../../../context/ThemeContext"
import ReactMarkdown from 'react-markdown';
import './markdown.css';

export default function NewAIMessage({message, openCanvas}:{message:string| undefined, openCanvas: () => any}) {
  const { theme } = useTheme();
  const { addArtifact } = useArtifact()
  
  // Regular expression for detecting URLs
  const urlRegex = /(https?:\/\/[^\s)]+[^\s.,)])/g;
  
  // Function to convert text with URLs to JSX with clickable links
  const renderTextWithLinks = (text: string) => {
    const parts = text.split(urlRegex);
    const matches = text.match(urlRegex);
    let currentUrlIndex = 0;
    
    return parts.map((part, index) => {
      if (matches && index < parts.length - 1) {
        const url = matches[currentUrlIndex];
        currentUrlIndex++;
        if(url) {
          addArtifact(url)
          // openCanvas()
        }
      }
      return part;
    });
  };

  return (
    <div className="flex gap-2 w-full text-black font-base">
      <img className="h-[30px] rounded-full" src="https://pbs.twimg.com/media/CrghjJoUMAEBcO_.jpg"/> 
      <div className='rounded-2xl rounded-tl-sm w-[92%]'>
          <div>
            <div className={`${theme.textColorPrimary} ${theme.aiMessageStyle ? theme.aiMessageStyle : "bg-transparent"} rounded-lg`}>
              <div className="markdown-content" style={{backgroundColor: 'inherit', padding:0}}>
                <ReactMarkdown>{message}</ReactMarkdown>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}