'use client'

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react'
import F4rmerType from '../components/types/F4rmerType'
import F4MCPClient from '../microstore/F4MCPClient'

type AgentContextType = {
  selectedAgent: F4rmerType | undefined
  setSelectedAgent: (agent: F4rmerType) => void
  availableAgents: F4rmerType[]
  setAvailableAgents: (agents: F4rmerType[]) => void
  client: F4MCPClient
  trustedServers: { [key: string]: boolean }
  setTrustedServers: Dispatch<SetStateAction<{ [key: string]: boolean }>>
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
  const [client, setClient] = useState<F4MCPClient>(new F4MCPClient("default f4rmer", []))
  const [trustedServers, setTrustedServersState] = useState<{[key: string]: boolean}>({})

  // Wrapper for setSelectedAgent that also saves to localStorage
  const setSelectedAgent = (agent: F4rmerType) => {
    setSelectedAgentState(agent)
    if (typeof window !== 'undefined') {
      localStorage.setItem('f4rmhouse-selected-agent', JSON.stringify(agent))
    }
    setClient(new F4MCPClient(agent.title, agent.toolbox))
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

  // Wrapper for setTrustedServers that also saves to localStorage
  const setTrustedServers = (servers: {[key: string]: boolean} | ((prev: {[key: string]: boolean}) => {[key: string]: boolean})) => {
    if (typeof servers === 'function') {
      setTrustedServersState(prev => {
        const newServers = servers(prev)
        if (typeof window !== 'undefined') {
          localStorage.setItem('f4rmhouse-trusted-servers', JSON.stringify(newServers))
        }
        return newServers
      })
    } else {
      setTrustedServersState(servers)
      if (typeof window !== 'undefined') {
        localStorage.setItem('f4rmhouse-trusted-servers', JSON.stringify(servers))
      }
    }
  }

  // Load saved data from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try to load selected agent from localStorage
      const savedAgent = localStorage.getItem('f4rmhouse-selected-agent')
      if (savedAgent) {
        try {
          const parsedAgent = JSON.parse(savedAgent) as F4rmerType
          setSelectedAgentState(parsedAgent)
          setClient(new F4MCPClient(parsedAgent.title, parsedAgent.toolbox))
        } catch (error) {
          setSelectedAgentState(defaultAgent)
          setClient(new F4MCPClient(defaultAgent.title, defaultAgent.toolbox))
        }
      } else {
        setSelectedAgentState(defaultAgent)
        setClient(new F4MCPClient(defaultAgent.title, defaultAgent.toolbox))
      }

      // Try to load trusted servers from localStorage
      const savedTrustedServers = localStorage.getItem('f4rmhouse-trusted-servers')
      if (savedTrustedServers) {
        try {
          const parsedServers = JSON.parse(savedTrustedServers) as {[key: string]: boolean}
          setTrustedServersState(parsedServers)
        } catch (error) {
          console.error('Failed to parse saved trusted servers:', error)
          setTrustedServersState({})
        }
      }
    }
  }, [])

  return (
    <AgentContext.Provider value={{ 
      selectedAgent: selectedAgent || defaultAgent, 
      setSelectedAgent, 
      availableAgents, 
      setAvailableAgents,
      client,
      trustedServers,
      setTrustedServers
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
