import React, { useState, useEffect, useRef } from 'react';
import { AtSign, Hash } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { useAgent } from '@/app/context/AgentContext';
import F4rmerType from '@/app/components/types/F4rmerType';
import ItemsDropdown from './ItemsDropdown';
import { useSession } from '@/app/context/SessionContext';
import User from '@/app/microstore/User';
import ConfirmModal from '../modal/ConfirmModal';
import Modal from '../modal/Modal';
import CreateProfileForm from '../../forms/CreateProfileForm';

export default function AgentSelector() {
  const { theme } = useTheme();
  const { selectedAgent, setSelectedAgent, availableAgents } = useAgent();

  const session = useSession();

  const selectRef = useRef<HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const handleDeleteClick = (item: any) => {
    const profile = availableAgents.filter(e => e.title === item.value)[0];
    setProfileToDelete(profile);
    setShowDeleteModal(true);
  };

  const confirmDeleteProfile = () => {
    if (profileToDelete && session?.user) {
      const user = new User(session.user.email, session.provider, session.access_token);
      user.deleteF4rmer(session.user.email, profileToDelete.uid).then(() => {
        setShowDeleteModal(false);
        setProfileToDelete(null);
        // Refresh the available agents list
        window.location.reload(); // You might want to implement a more elegant refresh
      }).catch((error) => {
        console.error('Failed to delete profile:', error);
        alert('Failed to delete profile. Please try again.');
      });
    }
  };

  const onAdd = () => {
    setShowCreateModal(true);
  }
  
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
          <AtSign size={15}/>
        </div>
        {selectedAgent && (
          <span className={`absolute left-8 w-[100px] text-xs ${theme.textColorSecondary || 'text-neutral-300'}`}>
            {selectedAgent.title}
          </span>
        )}
      </div>
      
      {/* Custom dropdown - shows on hover */}
      <ItemsDropdown
        items={availableAgents.map((agent:F4rmerType) => ({"value": agent.title, "decorator": ""}))}
        selectedItem={selectedAgent?.title}
        isVisible={isDropdownVisible}
        title="Select Profile"
        onItemSelect={handleAgentSelect}
        onDelete={(item:any) => handleDeleteClick(item)}
        onClose={() => {
          setIsClicked(false);
          setIsHovering(false);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onAdd={onAdd}
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
      
      {/* Delete confirmation modal */}
      <ConfirmModal
        open={showDeleteModal}
        setIsOpen={setShowDeleteModal}
        title="Delete Profile"
        content={`Are you sure you want to delete the profile "${profileToDelete?.title}"? This action cannot be undone.`}
        action={confirmDeleteProfile}
      />
      
      {/* Create profile modal */}
      <Modal open={showCreateModal} title="Create New Profile" onClose={() => setShowCreateModal(false)}>
        <CreateProfileForm />
      </Modal>
    </div>
  );
}
