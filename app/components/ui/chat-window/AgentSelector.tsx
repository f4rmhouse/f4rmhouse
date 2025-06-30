import React, { useState, useEffect, useRef } from 'react';
import { Hash } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { useAgent } from '@/app/context/AgentContext';
import F4rmerType from '@/app/components/types/F4rmerType';
import ItemsDropdown from './ItemsDropdown';

export default function AgentSelector() {
  const { theme } = useTheme();
  const { selectedAgent, setSelectedAgent, availableAgents } = useAgent();
  const selectRef = useRef<HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const isDropdownVisible = isHovering || isClicked;
  
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

  // Add click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsClicked(false);
        setIsHovering(false);
      }
    };

    if (isDropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownVisible]);
  
  const handleAgentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTitle = event.target.value;
    const agent = availableAgents.find(agent => agent.title === selectedTitle);
    if (agent) {
      setSelectedAgent(agent);
    }
  };

  const handleAgentSelect = (agent: string) => {
    const selectedProfile = availableAgents.find(a => a.title === agent)
    if(selectedProfile) {
      setSelectedAgent(selectedProfile);
    }
    setIsClicked(false); // Close dropdown after selection
    setIsHovering(false); // Also clear hover state to ensure dropdown closes
  };

  const handleIconClick = () => {
    setIsClicked(!isClicked);
  };
  
  return (
    <div className="relative" ref={containerRef}>
      {/* Hash icon - always visible */}
      <div 
        className={`transition-all rounded-md p-2 cursor-pointer flex items-center gap-2 ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleIconClick}
      >
        <div className="transition-all hover:rotate-[90deg]">
          <Hash size={15}/>
        </div>
        {selectedAgent && (
          <span className={`absolute left-8 w-[100px] text-xs ${theme.textColorSecondary || 'text-neutral-300'}`}>
            {selectedAgent.title}
          </span>
        )}
      </div>
      
      {/* Custom dropdown - shows on hover */}
      <ItemsDropdown
        items={availableAgents.map((agent:F4rmerType) => agent.title)}
        selectedItem={selectedAgent?.title}
        isVisible={isDropdownVisible}
        title="Select Profile"
        onItemSelect={handleAgentSelect}
        onClose={() => {
          setIsClicked(false);
          setIsHovering(false);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />
      
      {/* Hidden select for keyboard shortcuts compatibility */}
      <select
        id="agent-selector"
        ref={selectRef}
        className="sr-only"
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
