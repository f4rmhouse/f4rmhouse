"use client"
import F4Session from "../../types/F4Session";
import PromptBox from "./PromptBox";
import F4rmerType from "../../types/F4rmerType";
import { useState, useEffect } from "react";
import config from "../../../../f4.config"
import User from "@/app/microstore/User";
import { X, Plus } from "lucide-react";
import { useTheme } from '../../../context/ThemeContext'
import { useOnboarding } from '../../../context/OnboardingContext';
import { motion, AnimatePresence, Reorder } from "framer-motion";

/**
 * Boxes component that displays multiple PromptBoxes as tabs
 * @param param0 
 * @returns 
 */
function Boxes({f4rmers, session}: {f4rmers:F4rmerType[],session:F4Session}) {
  const { theme } = useTheme()
  const { completeStep, isStepCompleted, currentStep } = useOnboarding();
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
    completeStep(1); // Complete step 2 (add tab)
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
  
  // Update state for a specific tab
  const updateTabState = (id: string, newState: "canvas" | "chat" | "preview" | "edit") => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === id ? { ...tab, state: newState } : tab
      )
    );
  };

  return(
    <div className="absolute top-8 w-full h-[95%] overflow-hidden">
      {/* Desktop Layout: Tabs on left, content on right */}
      <div className="hidden md:flex flex-row h-full">
        {/* Tab Bar - Left side on desktop */}
        <div className={`flex flex-col items-start m-0 ${theme.backgroundColor} ${theme.secondaryColor} h-full`}>
          <Reorder.Group 
            axis="y" 
            values={tabs} 
            onReorder={setTabs} 
            className="w-full"
          >
            <div>
              {currentStep == 1 ? 
                <img className='absolute top-[-50px] left-5 z-[-1]' height={300} width={300} src="https://f4-public.s3.eu-central-1.amazonaws.com/public/assets/session_tabs.png"/>
              :
              <></>}
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
        
        {/* Tab Content - Desktop */}
        <div className="flex-1 overflow-hidden">
          {tabs.map(tab => (
            <div key={tab.id} className={`flex h-full ${tab.isActive ? 'block' : 'hidden'}`}>
              <PromptBox 
                f4rmers={f4rmers} 
                state={tab.state} 
                setState={(newState) => updateTabState(tab.id, newState)} 
                session={session}
                addTab={() => addTab()}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Layout: Content on top, tabs on bottom */}
      <div className="md:hidden flex flex-col h-full">
        {/* Tab Content - Mobile */}
        <div className="flex-1 overflow-hidden">
          {tabs.map(tab => (
            <div key={tab.id} className={`flex h-full ${tab.isActive ? 'block' : 'hidden'}`}>
              <PromptBox 
                f4rmers={f4rmers} 
                state={tab.state} 
                setState={(newState) => updateTabState(tab.id, newState)} 
                session={session}
                addTab={() => addTab()}
              />
            </div>
          ))}
        </div>

        <div className={`flex flex-row items-center ${theme.backgroundColor} ${theme.secondaryColor} w-full`}>
          <Reorder.Group 
            axis="x" 
            values={tabs} 
            onReorder={setTabs} 
            className="flex flex-row flex-1 overflow-x-auto"
          >
            <div className="flex flex-row">
              {tabs.map(tab => (
                <Reorder.Item 
                  key={tab.id} 
                  value={tab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    backgroundColor: tab.isActive 
                      ? theme.primaryColor?.replace('bg-', '') || '#1f2937' 
                      : theme.secondaryColor?.replace('bg-', '') || 'transparent',
                    color: tab.isActive 
                      ? theme.textColorPrimary?.replace('text-', '') || 'text-black'
                      : theme.textColorSecondary?.replace('text-', '') || '#9ca3af',
                    borderTop: tab.isActive ? '4px solid #ffde59' : '4px solid transparent',
                    fontWeight: tab.isActive ? 600 : 400
                  }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 30 
                  }}
                  className={`flex items-center px-3 py-2 cursor-move whitespace-nowrap ${theme.textColorPrimary} ${tab.isActive ? 'shadow-md' : ''}`}
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
                </Reorder.Item>
              ))}
            </div>
          </Reorder.Group>
          <button 
            onClick={addTab}
            className={`p-2 flex justify-center ${theme.textColorPrimary|| 'text-gray-400'} ${theme.accentColor} rounded-full shadow mr-2`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}


export default Boxes