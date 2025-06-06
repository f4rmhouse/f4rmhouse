import { Bot, BotMessageSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from "../../../context/ThemeContext";
import { useAgent } from "../../../context/AgentContext";
import F4rmerType from '../../types/F4rmerType';

export default function AgentSelector() {
  const { theme } = useTheme();
  const { selectedAgent, setSelectedAgent, availableAgents } = useAgent();
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
        if (!isNaN(numKey) && numKey >= 1 && numKey <= availableAgents.length) {
          event.preventDefault();
          
          // Get agent at index (subtract 1 since arrays are 0-indexed but keys start at 1)
          const f4merIndex = numKey - 1;
          const agent = availableAgents[f4merIndex];

          // Select the agent
          setSelectedAgent(agent);
          
          // Update the select element's value
          if (selectRef.current) {
            selectRef.current.value = agent.title;
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
  }, [availableAgents, setSelectedAgent]);
  
  const handleAgentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTitle = event.target.value;
    const agent = availableAgents.find(agent => agent.title === selectedTitle);
    if (agent) {
      setSelectedAgent(agent);
    }
  };
  
  return (
    <div className={`rounded-md group cursor-pointer flex ${theme.primaryColor} hover:${theme.primaryHoverColor} transition-all`}>
      <select
        id="agent-selector"
        ref={selectRef}
        className={`transition-all rounded-md cursor-pointer ${theme.textColorSecondary} block w-full text-xs border-none bg-transparent`}
        value={selectedAgent?.title || (availableAgents.length > 0 ? availableAgents[0].title : '')}
        onChange={handleAgentChange}
      >
        {availableAgents.map((f4rmer:F4rmerType) => (
          <option key={f4rmer.uid} value={f4rmer.title}>
            {f4rmer.title}
          </option>
        ))}
      </select>
    </div>
  );
}
