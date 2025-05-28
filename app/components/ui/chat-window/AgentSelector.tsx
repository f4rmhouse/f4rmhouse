import { Bot, BotMessageSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from "../../../context/ThemeContext";
import F4rmerType from '../../types/F4rmerType';

export default function AgentSelector({ f4rmers, onAgentSelect, selectedF4rmer }: { f4rmers: F4rmerType[], onAgentSelect: (agent: F4rmerType) => void, selectedF4rmer: F4rmerType | null }) {
  const { theme } = useTheme();
  const selectRef = useRef<HTMLSelectElement>(null);
  
  // Add keyboard shortcut listener for Cmd+A to open agent selector and Option+number to select agents
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts if not in an input field or textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Check for key combinations
      
      // Cmd+A to open agent selector
      if ((event.metaKey || event.ctrlKey) && event.key === 'a') {
        event.preventDefault(); // Prevent default browser behavior (select all)
        
        // Focus and open the select dropdown
        if (selectRef.current) {
          selectRef.current.focus();
          // Simulate a click to open the dropdown
          selectRef.current.click();
        }
      }
      
      // Option+number (Alt+number) to select agent by index
      if (event.ctrlKey) {
        const numKey = parseInt(event.key);
        if (!isNaN(numKey) && numKey >= 1 && numKey <= f4rmers.length) {
          event.preventDefault();
          
          // Get agent at index (subtract 1 since arrays are 0-indexed but keys start at 1)
          const f4merIndex = numKey - 1;
          const selectedF4rmer = f4rmers[f4merIndex];

          // Select the agent
          onAgentSelect(selectedF4rmer);
          
          // Update the select element's value
          if (selectRef.current) {
            selectRef.current.value = selectedF4rmer.title;
          }
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const handleAgentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    const f4rmer = f4rmers.find(f4rmer => f4rmer.title === selectedId);
    if (f4rmer) {
      onAgentSelect(f4rmer);
    }
  };
  
  return (
    <div className={`group cursor-pointer flex ${theme.primaryColor} hover:${theme.primaryHoverColor} transition-all`}>
      <label htmlFor="agent-selector" className="text-xs m-auto">
        <BotMessageSquare className={`m-auto ml-2 ${theme.accentColor ? theme.accentColor.replace("bg", "text") : "text-blue-500"}`} size={15}/>
      </label>
      <select
        id="agent-selector"
        ref={selectRef}
        className={`transition-all rounded-r-md cursor-pointer ${theme.textColorSecondary} block w-full text-xs border-none bg-transparent`}
        value={selectedF4rmer?.title|| f4rmers[0].title}
        onChange={handleAgentChange}
      >
        {f4rmers.map((f4rmer:F4rmerType) => (
          <option key={f4rmer.uid} value={f4rmer.title}>
            {f4rmer.title}
          </option>
        ))}
      </select>
    </div>
  );
}
