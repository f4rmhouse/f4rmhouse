'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type ArtifactContextType = {
  artifacts: string[]
  currentArtifact: string | null
  setCurrentArtifact: (url: string | null) => void
  addArtifact: (url: string) => void
  updateArtifact: (index:number) => void
}

const ArtifactContext = createContext<ArtifactContextType | undefined>(undefined)

export function ArtifactProvider({ children }: { children: ReactNode }) {
  const [artifacts, setArtifacts] = useState<string[]>([])
  const [currentArtifact, setCurrentArtifact] = useState<string | null>(null)

  const addArtifact = (url: string) => {
    if (!artifacts.includes(url)) {
      let _tmp = artifacts
      _tmp.push(url)
      setArtifacts(_tmp)
      setCurrentArtifact(url)
    } else {
      console.log("artifact already exists: ", url)
    }
  }

  const updateArtifact = (index:number) => {
    setCurrentArtifact(artifacts[index])
  }

  return (
    <ArtifactContext.Provider value={{ artifacts, currentArtifact, setCurrentArtifact, addArtifact, updateArtifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export function useArtifact() {
  const context = useContext(ArtifactContext)
  if (context === undefined) {
    throw new Error('useArtifact must be used within an ArtifactProvider')
  }
  return context
}
