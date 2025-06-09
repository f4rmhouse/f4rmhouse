import { useTheme } from "../../../context/ThemeContext";
import { Lock, LockKeyholeOpen, Shield, ShieldOff } from "lucide-react";
import { useState } from "react";

export default function F4AuthMessage({uti, timestamp}:{uti:string, timestamp: number}) {
  const { theme } = useTheme();
  const [isHovering, setIsHovering] = useState(false);
  const style = `flex flex-col ml-auto ${theme.textColorPrimary} border ${theme.secondaryColor.replace("bg", "border")} w-full rounded-md p-2`;
  // "secondaryColor": "bg-[#1f1f1f]",
  
  return (
    <div className={style}>
      <p className="flex items-center gap-2"><Shield size={15} /> {uti} asks you to authenticate:</p>
      <p className={`text-xs mt-1 mb-2 ${theme.textColorSecondary}`}>When you authenticate you will be redirected to a page that let's you choose the permissions that you want to grant the tool.</p>
      <div className="flex gap-2">
        <button 
          className={`flex m-auto items-center gap-2 ${theme.secondaryColor} rounded w-1/2 p-2 transition-colors hover:${theme.secondaryHoverColor}`}
        >
          <div className="flex items-center gap-2 m-auto">
            <ShieldOff size={15}/>
            Cancel
          </div>
        </button>
        <button 
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`${theme.accentColor} hover:${theme.primaryHoverColor} rounded w-1/2 p-2 flex m-auto transition-all`}
        >
          <div className="flex items-center gap-2 m-auto">
            {isHovering ? 
              <LockKeyholeOpen className="my-auto transition-all" size={15} /> : 
              <Lock className="my-auto transition-all" size={15} />
            } 
            Authenticate
          </div>
        </button>
      </div>
      <p className="text-xs text-neutral-400 mt-auto ml-2 mr-2 pb-1">{(new Date(timestamp)).getHours().toString().padStart(2, '0')}:{(new Date(timestamp)).getMinutes().toString().padStart(2, '0')}</p>
    </div>
  )
}