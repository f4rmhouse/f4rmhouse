"use client"
import F4Session from "../../types/F4Session";
import PromptBox from "./PromptBox";
import F4rmerType from "../../types/F4rmerType";
import { useState, useEffect } from "react";
import config from "../../../../f4.config"
import User from "@/app/microstore/User";
import { X, Plus } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { motion, AnimatePresence, Reorder } from "framer-motion";

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
        title: "1"
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
        title: `${prevTabs.length + 1}`
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
  
  // Drag and drop handlers
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedTabId(id);
    // Set the drag image to be the tab itself
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    
    if (draggedTabId && draggedTabId !== targetId) {
      setTabs(prevTabs => {
        // Find the indices of the dragged and target tabs
        const draggedTabIndex = prevTabs.findIndex(tab => tab.id === draggedTabId);
        const targetTabIndex = prevTabs.findIndex(tab => tab.id === targetId);
        
        if (draggedTabIndex === -1 || targetTabIndex === -1) return prevTabs;
        
        // Create a new array with the dragged tab moved to the target position
        const newTabs = [...prevTabs];
        const [draggedTab] = newTabs.splice(draggedTabIndex, 1);
        newTabs.splice(targetTabIndex, 0, draggedTab);
        
        return newTabs;
      });
    }
    
    setDraggedTabId(null);
  };
  
  const handleDragEnd = () => {
    setDraggedTabId(null);
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
    <div className="absolute flex flex-row top-8 w-full h-[95%] overflow-hidden">
      {/* Tab Bar - Now on the left side */}
      <div className={`flex flex-col items-start m-0 ${theme.backgroundColor} ${theme.secondaryColor} h-full`}>
        <Reorder.Group 
          axis="y" 
          values={tabs} 
          onReorder={setTabs} 
          className="w-full"
        >
          <div>
            {tabs.map(tab => (
              <Reorder.Item 
                key={tab.id} 
                value={tab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  backgroundColor: tab.isActive 
                    ? theme.primaryColor?.replace('bg-', '') || '#1f2937' 
                    : theme.secondaryColor?.replace('bg-', '') || 'transparent',
                  color: tab.isActive 
                    ? theme.textColorPrimary?.replace('text-', '') || 'text-black'
                    : theme.textColorSecondary?.replace('text-', '') || '#9ca3af',
                  borderLeft: tab.isActive ? '4px solid #ffde59' : '4px solid transparent',
                  fontWeight: tab.isActive ? 600 : 400
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30 
                }}
                className={`flex items-center w-full px-3 py-2 cursor-move ${theme.textColorPrimary} ${tab.isActive ? 'shadow-md' : ''}`}
                onClick={() => activateTab(tab.id)}
              >
                <span className="mr-2 text-xs">{tab.title}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="hover:text-red-500 ml-auto"
                >
                  <X size={14} />
                </button>
              </Reorder.Item>
            ))}
          </div>
        </Reorder.Group>
        <button 
          onClick={addTab}
          className={`p-2 w-full flex justify-center ${theme.textColorPrimary|| 'text-gray-400'}`}
        >
          <div>
            <Plus size={18} />
          </div>
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.map(tab => (
          <div key={tab.id} className={`flex h-full ${tab.isActive ? 'block' : 'hidden'}`}>
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