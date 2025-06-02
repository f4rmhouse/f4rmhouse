"use client"
import F4Session from "../../types/F4Session";
import PromptBox from "./PromptBox";
import F4rmerType from "../../types/F4rmerType";
import { useState, useEffect } from "react";
import config from "../../../../f4.config"
import User from "@/app/microstore/User";
import { X, Plus } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

/**
 * Boxes component that displays multiple PromptBoxes as tabs
 * @param param0 
 * @returns 
 */
function Boxes({f4rmers, session}: {f4rmers:F4rmerType[],session:F4Session}) {
  const { theme } = useTheme();
  const [tabs, setTabs] = useState<Array<{
    id: string;
    state: "canvas" | "chat" | "preview" | "edit";
    isActive: boolean;
    title: string;
  }>>([]);
  
  // Initialize with one tab on first render
  useEffect(() => {
    if (tabs.length === 0) {
      setTabs([{
        id: "tab-" + Date.now(),
        state: config.defaultState,
        isActive: true,
        title: "Chat 1"
      }]);
    }
  }, []);

  // Add a new tab
  const addTab = () => {
    const newTabId = "tab-" + Date.now();
    setTabs(prevTabs => [
      ...prevTabs.map(tab => ({ ...tab, isActive: false })),
      {
        id: newTabId,
        state: config.defaultState,
        isActive: true,
        title: `Chat ${prevTabs.length + 1}`
      }
    ]);
  };

  // Close a tab
  const closeTab = (id: string) => {
    // Don't close if it's the only tab
    if (tabs.length <= 1) return;
    
    const tabIndex = tabs.findIndex(tab => tab.id === id);
    const isActiveTab = tabs[tabIndex].isActive;
    
    const newTabs = tabs.filter(tab => tab.id !== id);
    
    // If we closed the active tab, activate another one
    if (isActiveTab && newTabs.length > 0) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      newTabs[newActiveIndex].isActive = true;
    }
    
    setTabs(newTabs);
  };

  // Activate a tab
  const activateTab = (id: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => ({
        ...tab,
        isActive: tab.id === id
      }))
    );
  };

  // Update state for a specific tab
  const updateTabState = (id: string, newState: "canvas" | "chat" | "preview" | "edit") => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === id ? { ...tab, state: newState } : tab
      )
    );
  };

  return(
    <div className="fixed flex flex-col w-full overflow-hidden">
      {/* Tab Bar */}
      <div className={`flex items-center bg-black`}>
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className={`flex items-center mr-2 px-3 py-1 rounded-t-md cursor-pointer ${tab.isActive 
              ? `${theme.primaryColor || 'bg-gray-800'} ${theme.textColorPrimary || 'text-white'}` 
              : `hover:bg-gray-700 ${theme.textColorSecondary || 'text-gray-400'}`}`}
            onClick={() => activateTab(tab.id)}
          >
            <span className="mr-2 text-xs">{tab.title}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="hover:text-red-500"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button 
          onClick={addTab}
          className={`p-1 rounded-md ${theme.textColorSecondary || 'text-gray-400'} hover:${theme.secondaryHoverColor || 'text-gray-300'}`}
        >
          <Plus size={18} />
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.map(tab => (
          <div key={tab.id} className={`h-full ${tab.isActive ? 'block' : 'hidden'}`}>
            <PromptBox 
              f4rmers={f4rmers} 
              state={tab.state} 
              setState={(newState) => updateTabState(tab.id, newState)} 
              session={session}
            />
          </div>
        ))}
      </div>
    </div>
  )
}


export default Boxes