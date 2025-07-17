import { useEffect, useState, useRef } from "react";
import { Timer } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';

export default function NewAIMessage({id, message, latency}:{id: string, message:string| undefined, latency: number}) {
  const { theme } = useTheme();

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