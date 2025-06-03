'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import F4rmerType from '../components/types/F4rmerType'

type AgentContextType = {
  selectedAgent: F4rmerType | undefined
  setSelectedAgent: (agent: F4rmerType) => void
  availableAgents: F4rmerType[]
  setAvailableAgents: (agents: F4rmerType[]) => void
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: ReactNode }) {
  // Default agent to use if none is available
  const defaultAgent: F4rmerType = {
    uid: "default-f4rmer", 
    title: "Default F4rmer", 
    jobDescription: "You are a helpful assistant known as a 'f4rmer' on the 'f4rmhouse' platform. You know how to be helpful and write very nicely formatted markdown answers to user prompts. Users asking you questions will be able to give you tools to make you even more useful. Always reason through step by step when answering complex question if you can't answer some question be sure to remind users that there are tools available on the platform that can help them.", 
    toolbox: [], 
    creator: "", 
    created: "0"
  }

  // Initialize agent state
  const [selectedAgent, setSelectedAgentState] = useState<F4rmerType | undefined>(undefined)
  const [availableAgents, setAvailableAgentsState] = useState<F4rmerType[]>([defaultAgent])

  // Wrapper for setSelectedAgent that also saves to localStorage
  const setSelectedAgent = (agent: F4rmerType) => {
    setSelectedAgentState(agent)
    if (typeof window !== 'undefined') {
      localStorage.setItem('f4rmhouse-selected-agent', JSON.stringify(agent))
    }
  }

  // Wrapper for setAvailableAgents
  const setAvailableAgents = (agents: F4rmerType[]) => {
    // Ensure we always have at least the default agent
    const agentsWithDefault = agents.length > 0 ? agents : [defaultAgent]
    setAvailableAgentsState(agentsWithDefault)
    
    // If no agent is selected or the selected agent is no longer available,
    // select the first available agent
    if (!selectedAgent || !agentsWithDefault.some(a => a.uid === selectedAgent.uid)) {
      setSelectedAgent(agentsWithDefault[0])
    }
  }

  // Load saved agent from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try to load selected agent from localStorage
      const savedAgent = localStorage.getItem('f4rmhouse-selected-agent')
      if (savedAgent) {
        try {
          const parsedAgent = JSON.parse(savedAgent) as F4rmerType
          setSelectedAgentState(parsedAgent)
        } catch (error) {
          console.error('Failed to parse saved agent:', error)
          setSelectedAgentState(defaultAgent)
        }
      } else {
        // If no saved agent, use the default
        setSelectedAgentState(defaultAgent)
      }
    }
  }, [])

  return (
    <AgentContext.Provider value={{ 
      selectedAgent: selectedAgent || defaultAgent, 
      setSelectedAgent, 
      availableAgents, 
      setAvailableAgents 
    }}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
}
