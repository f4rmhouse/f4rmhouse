import { Bot, BotMessageSquare } from 'lucide-react';
import { useState } from 'react';
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
