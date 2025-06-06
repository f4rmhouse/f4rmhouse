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

export default function NewAIMessage({message}:{message:string| undefined}) {
  const { theme } = useTheme();

  return (
    <>
    {message &&
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
    }
    </>
  )
}