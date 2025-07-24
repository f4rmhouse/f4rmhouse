import { useState, useEffect } from "react";
import { CirclePlus, Hammer } from "lucide-react";
import { useArtifact } from "../../../context/ArtifactContext";
import { useTheme } from "../../../context/ThemeContext";

export default function RemoteToolResponse({message, debug}:{message:string | undefined, debug: any}) {
  const [showMore, setShowMore] = useState<boolean>(false)
  const { theme } = useTheme();
  
  return (
    <div className="">
      <div onClick={() => setShowMore(p => !p)} className={`group flex ${theme.secondaryColor} rounded-md p-2 shadow hover:${theme.primaryColor} cursor-pointer`}>
        <button className={`group-hover:rotate-45 transition-all rounded ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`} onClick={() => setShowMore(p => !p)}>
          <Hammer size={15}/>
        </button>
        <p className={`mt-auto ml-2 text-xs ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}>Response </p>
      </div>
      <div className='w-full'>
          <div className="w-full">
          {
            showMore ?
            <div className="">
              <div className={`block w-full ${theme.textColorPrimary} text-xs font-mono`}>{<div>{ JSON.stringify(message) }</div>}</div>
              <button className={`flex ${theme.secondaryColor} rounded w-[100%] text-neutral-400 p-1`} onClick={() => setShowMore(p => !p)}>
              <Hammer size={15}/>
              <p className={`text-xs font-mono ml-2 ${theme.textColorPrimary}`}>hide</p>
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