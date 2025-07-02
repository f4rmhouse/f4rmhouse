"use client"
import { FormEvent, KeyboardEvent } from "react";
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
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, but allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Create a synthetic form event to trigger onSubmit
      const form = e.currentTarget.closest('form');
      if (form) {
        const syntheticEvent = new Event('submit', { bubbles: true, cancelable: true }) as any;
        syntheticEvent.preventDefault = () => {};
        onSubmit(syntheticEvent);
      }
    }
  };
  
  return(
    <form onSubmit={onSubmit} className={`${theme.secondaryColor ? theme.secondaryColor.replace("bg", "border") : "border neutral-700"} rounded-md flex flex-col ${theme.primaryColor ? theme.primaryColor : "bg-neutral-800"}`}>
      <div className="flex w-full p-1">
        <textarea
          className={`border-none grow ${theme.textColorPrimary} ${theme.primaryColor ? theme.primaryColor : "bg-neutral-800"} border-none z-10 focus:outline-none focus:ring-0 resize-none min-h-[40px] max-h-[200px] overflow-y-auto`}
          value={value}
          placeholder={"Type a message or use /help for help"}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />
      </div>
      <div>
      </div>
    </form>
  )
}