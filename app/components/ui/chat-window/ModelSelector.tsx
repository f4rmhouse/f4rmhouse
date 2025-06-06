import { Brain } from 'lucide-react';
import { useState, useEffect } from 'react';
import config from "../../../../f4.config";
import { useTheme } from "../../../context/ThemeContext";

interface Model {
  id: string;
  name: string;
  provider: string;
}

export default function ModelSelector({ onModelSelect, selectedModel }: { onModelSelect: (model: Model) => void, selectedModel: Model | null }) {
  const { theme } = useTheme();
  const [availableProviders, setAvailableProviders] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check for environment variables to determine available providers
    const checkAvailableProviders = () => {
      setAvailableProviders(config.models);
      
      const availableModels = getAvailableModels();
      if (availableModels.length > 0 && !selectedModel) {
        onModelSelect(availableModels[0].id);
      }
    };
    
    checkAvailableProviders();
    setLoading(false)
  }, [selectedModel, onModelSelect]);
  
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
    
    return models;
  };
  
  const availableModels = getAvailableModels();
  
  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    const selectedModel = availableModels.find(model => model.id === selectedId);
    onModelSelect(selectedModel);
  };
  
  if(loading) {
    return(<div className="group cursor-pointer flex rounded-md hover:bg-neutral-600 transition-all">
      <label htmlFor="model-selector" className="text-xs m-auto">
        <Brain className='m-auto ml-2' size={15}/>
      </label>
      <select
        id="model-selector"
        className="transition-all group-hover:bg-neutral-600 cursor-pointer block w-full text-xs rounded-full border-none bg-neutral-700"
        defaultValue="loading"
      >
        <option>loading...</option>
      </select>
    </div>)
  }

  if (availableModels.length === 0 && !loading) {
    return (
      <div className="p-4 border rounded-b-md w-[16cm] border-neutral-800 border-t-none text-xs text-red-500 absolute bg-neutral-900">
        <p>No API keys detected. Please set at least one provider API key to continue.</p>
        <ul className="list-disc pl-5 mt-2">
          {<li>Set OPENAI_SECRET for OpenAI models</li>}
          {<li>Set ANTHROPIC_SECRET for Anthropic models</li>}
        </ul>
      </div>
    );
  }
  
  return (
    <div className={`m-1 rounded group cursor-pointer flex ${theme.primaryColor} hover:${theme.primaryHoverColor} transition-all`}>
      <select
        id="model-selector"
        className={`transition-all rounded-md cursor-pointer ${theme.textColorSecondary} block text-xs border-none bg-transparent`}
        value={selectedModel?.id || availableModels[0].id}
        onChange={handleModelChange}
      >
        {availableModels.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}