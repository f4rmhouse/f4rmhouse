import { useTheme } from "../../../context/ThemeContext";
import { Lock, LockKeyholeOpen, Shield, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";

interface F4AuthMessageProps {
  uti: string;
  deactivated: boolean;
  state: string;
  uri: string;
  debug: Object;
  onAuthenticate?: (uti: string) => Promise<void>;
  onCancel?: (uti: string) => void;
}

export default function F4ConfirmMessage({uti, deactivated, state, uri, debug, onAuthenticate, onCancel}: F4AuthMessageProps) {
  const { theme } = useTheme();
  const [isHovering, setIsHovering] = useState(false);
  const [currentDeactivated, setCurrentDeactivated] = useState(deactivated)
  const [currentStatus, setCurrentStatus] = useState(state)
  const style = `flex flex-col ml-auto ${theme.textColorPrimary} border ${theme.secondaryColor.replace("bg", "border")} w-full rounded-md p-2`;

  useEffect(() => {
    setCurrentDeactivated(deactivated)
    setCurrentStatus(state)
  }, [deactivated, state])
  
  return (
    <div className={style}>
      {currentDeactivated ?
        <p className="flex items-center gap-2"><Shield size={15} /> {uti} authentication has been {currentStatus}</p>
        :
        <>
        <p className="flex items-center gap-2"><Shield size={15} /> {uti} asks you to confirm:</p>
        <p className={`text-xs mt-1 mb-2 ${theme.textColorSecondary}`}>If you confirm you allow the LLM to send this message to the server. Note: MAKE SURE TO ONLY CONFIRM MESSAGES WITH SERVERS THAT YOU TRUST!</p>
        <pre className={`mt-1 mb-2 ${theme.secondaryColor} p-2 rounded text-xs overflow-auto whitespace-pre-wrap font-mono`}>
          {JSON.stringify(debug, null, 2)}
        </pre>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setCurrentDeactivated(true);
              setCurrentStatus("cancelled");
              if (onCancel) {
                onCancel(uti);
              }
            }}
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
            onClick={async () => {
              // setCurrentDeactivated(true);
              setCurrentStatus("pending");
              if (onAuthenticate) {
                await onAuthenticate(uti);
              }
            }}
          >
            <div className="flex items-center gap-2 m-auto">
              {isHovering ? 
                <LockKeyholeOpen className="my-auto transition-all" size={15} /> : 
                <Lock className="my-auto transition-all" size={15} />
              } 
              Confirm
            </div>
          </button>
        </div>
      </>
      }
    </div>
  )
}