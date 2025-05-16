import config from "../../../../f4.config";
import { useTheme } from "../../../context/ThemeContext";

export default function F4UserMessage({content, timestamp}:{content:string, timestamp: number}) {
  const { theme } = useTheme();
  let style = `flex ml-auto ${theme.accentColor} rounded-tr-sm rounded-xl`;
  return (
    <div className={style}>
      <p className="m-auto p-2">{content}</p>
      <p className="text-xs text-neutral-300 mt-auto ml-2 mr-2 pb-1">{(new Date(timestamp)).getHours().toString().padStart(2, '0')}:{(new Date(timestamp)).getMinutes().toString().padStart(2, '0')}</p>
    </div>
  )
}