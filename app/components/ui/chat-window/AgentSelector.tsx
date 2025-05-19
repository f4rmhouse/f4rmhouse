import { Bot, BotMessageSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from "../../../context/ThemeContext";

interface Agent {
  id: string;
  name: string;
}

// List of available agents
const availableAgents: Agent[] = [
  { id: 'seo-agent', name: 'SEO Agent' },
  { id: 'webdev-gpt', name: 'WebDevGPT' },
  { id: 'lawyer-gpt', name: 'LawyerGPT' }
];

export default function AgentSelector({ onAgentSelect, selectedAgent }: { onAgentSelect: (agent: Agent) => void, selectedAgent: Agent | null }) {
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
        console.log(event.key)
        const numKey = parseInt(event.key);
        if (!isNaN(numKey) && numKey >= 1 && numKey <= availableAgents.length) {
          event.preventDefault();
          
          // Get agent at index (subtract 1 since arrays are 0-indexed but keys start at 1)
          const agentIndex = numKey - 1;
          const selectedAgent = availableAgents[agentIndex];

          // Select the agent
          onAgentSelect(selectedAgent);
          
          // Update the select element's value
          if (selectRef.current) {
            selectRef.current.value = selectedAgent.id;
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
    const agent = availableAgents.find(agent => agent.id === selectedId);
    if (agent) {
      onAgentSelect(agent);
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
        value={selectedAgent?.id || availableAgents[0].id}
        onChange={handleAgentChange}
      >
        {availableAgents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
    </div>
  );
}
