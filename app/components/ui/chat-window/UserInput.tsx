"use client"
import { FormEvent } from "react";
import { CornerRightUp } from "lucide-react";
import config from "../../../../f4.config"
import { useTheme } from "../../../context/ThemeContext";

/**
 * UserInput is the text input box at the bottom of the screen on / and /dashboard page
 * when the send button is pressed a request is sent to the /llm endpoint which 
 * will return a response from the f4rmer that is currently selected
 * 
 * @param param0 
 * @returns 
 */

export default function UserInput({onSubmit, onChange, value, children}: {onSubmit: (e: FormEvent<HTMLFormElement>) => any, onChange: (e:any) => void, value: string, children?: React.ReactNode}) {
  const { theme } = useTheme();
  return(
    <form onSubmit={onSubmit} className={`${theme.secondaryColor ? theme.secondaryColor.replace("bg", "border") : "border neutral-700"} flex flex-col ${theme.primaryColor ? theme.primaryColor : "bg-neutral-800"}`}>
      <div className="flex w-full">
        <input
          className={`grow ${theme.textColorPrimary} ${theme.primaryColor ? theme.primaryColor : "bg-neutral-800"} border-none z-10`}
          value={value}
          placeholder={"Ask me anything"}
          onChange={onChange}
        />
        <button type="submit" className={`transition-all shrink-0 ${theme.accentColor} ${theme.hoverColor ? "hover:" + theme.hoverColor : ""} rounded-md flex`}>
          <span className="p-3 pr-3 pl-3"><CornerRightUp size={20}/></span>
        </button>
      </div>
      <div>
        {children}
      </div>
    </form>
  )
}