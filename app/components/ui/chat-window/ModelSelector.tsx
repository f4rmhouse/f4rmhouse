import React, { useState, useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';
import config from "../../../../f4.config";
import { useTheme } from "@/app/context/ThemeContext";
import ItemsDropdown from './ItemsDropdown';

interface Model {
  id: string;
  name: string;
  provider: string;
  logo: string
}

export default function ModelSelector({ onModelSelect, selectedModel }: { onModelSelect: (model: Model) => void, selectedModel: Model | null }) {
  const { theme } = useTheme();
  const [availableProviders, setAvailableProviders] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isDropdownVisible = isHovering || isClicked;

  useEffect(() => {
    // Check for environment variables to determine available providers
    const checkAvailableProviders = () => {
      setAvailableProviders(config.models);
      
      const availableModels = getAvailableModels();
      if (availableModels.length > 0 && !selectedModel) {
        onModelSelect(availableModels[0]);
      }
    };
    
    checkAvailableProviders();
    setLoading(false)
  }, [selectedModel, onModelSelect]);
  
  // Click outside handler
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
  
  const getAvailableModels = () => {
    let models:any[] = [];
    
    if (config.models.openai) {
      models = models.concat(config.models.openai);
    }
    
    if (config.models.anthropic) {
      models = models.concat(config.models.anthropic);
    }

    if (config.models.local) {
      models = models.concat(config.models.local);
    }

    if (config.models.groq) {
      models = models.concat(config.models.groq);
    }
    if (config.models.google) {
      models = models.concat(config.models.google);
    }
    if (config.models.moonshot) {
      models = models.concat(config.models.moonshot);
    }
    
    return models;
  };
  
  const availableModels = getAvailableModels();
  
  const handleModelSelect = (modelName: string) => {
    const selectedModel = availableModels.find(model => model.name === modelName);
    if (selectedModel) {
      onModelSelect(selectedModel);
    }
    setIsClicked(false);
    setIsHovering(false);
  };
  
  const handleIconClick = () => {
    setIsClicked(!isClicked);
  };
  
  if(loading) {
    return(
      <div className="relative" ref={containerRef}>
        <div className={`transition-all hover:rotate-[90deg] rounded-md p-2 cursor-pointer ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}>
          <Brain size={15}/>
        </div>
      </div>
    )
  }

  if (availableModels.length === 0 && !loading) {
    return (
      <div className="relative" ref={containerRef}>
        <div className={`transition-all hover:rotate-[90deg] rounded-md p-2 cursor-pointer ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}>
          <Brain size={15}/>
        </div>
        <div className="absolute top-full left-0 mt-2 p-4 border rounded-md w-64 border-neutral-800 text-xs text-red-500 bg-neutral-900 z-50">
          <p>No API keys detected. Please set at least one provider API key to continue.</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Set OPENAI_SECRET for OpenAI models</li>
            <li>Set ANTHROPIC_SECRET for Anthropic models</li>
          </ul>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative" ref={containerRef}>
      <div 
        className={`transition-all rounded-md p-2 cursor-pointer flex items-center gap-2 ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleIconClick}
      >
        <div className="transition-all hover:rotate-[90deg]">
          <Brain size={15}/>
        </div>
        {selectedModel && (
          <span className={`absolute left-8 w-[100px] text-xs ${theme.textColorSecondary || 'text-neutral-300'}`}>
            {selectedModel.name}
          </span>
        )}
      </div>
      
      <ItemsDropdown
        items={availableModels.map((model: Model) => ({"value": model.name, "decorator": model.logo}))}
        selectedItem={selectedModel?.name}
        isVisible={isDropdownVisible}
        title="Select Model"
        onItemSelect={handleModelSelect}
        onClose={() => {
          setIsClicked(false);
          setIsHovering(false);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />
    </div>
  );
}