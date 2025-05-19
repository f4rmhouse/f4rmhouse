'use client'

import { CircleHelp } from "lucide-react"
import { useState } from "react"
import Modal from "./modal/Modal"
import { useTheme } from "@/app/context/ThemeContext"

export default function HelpModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { theme } = useTheme()
  
  // Keyboard shortcuts to display in the help modal
  const keyboardShortcuts = [
    { keys: 'Cmd/Ctrl+B', description: 'Toggle left sidebar' },
    { keys: 'Cmd/Ctrl+M', description: 'Toggle right sidebar' },
    { keys: 'Cmd/Ctrl+H', description: 'Toggle between store and home' },
    { keys: 'Cmd/Ctrl+A', description: 'Open agent selector dropdown' },
    { keys: 'Cmd/Ctrl+O', description: 'Open canvas' },
    { keys: 'Cmd/Ctrl+X', description: 'Clear chat' },
    { keys: 'Cmd/Ctrl+<number>', description: 'Select agent by number' },
    { keys: 'Cmd/Ctrl+Backspace', description: 'Deselect everything on screen' }
  ]
  
  // General help topics
  const helpTopics = [
    { 
      title: 'Getting Started', 
      content: 'Start by adding tools to your toolbox and then select an agent to start interacting with it.'
    },
    { 
      title: 'Using Tools', 
      content: 'Browse available tools in the store and add them to your toolbox to enhance your AI interactions.'
    },
    { 
      title: 'Changing Themes', 
      content: 'Click on the Theme button to customize the appearance of the interface.'
    }
  ]

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex text-neutral-500 hover:text-white px-1 underline text-xs"
      >
        <CircleHelp className="w-4 h-4" />
        Help
      </button>
      
      <Modal open={isModalOpen} title="Help & Keyboard Shortcuts">
        <div className="p-4">
          <div className={`mb-6 ${theme.textColorPrimary}`}>
            <h3 className="text-sm font-bold mb-3">Keyboard Shortcuts</h3>
            <div className="grid gap-2">
              {keyboardShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center">
                  <div className={`px-2 py-1 rounded text-xs font-mono ${theme.secondaryColor} ${theme.textColorPrimary}`}>
                    {shortcut.keys}
                  </div>
                  <span className={`ml-3 text-xs ${theme.textColorSecondary}`}>{shortcut.description}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 mb-3">
            <h3 className="text-sm font-bold mb-3">Docs</h3>
            <p className={`text-xs ${theme.textColorSecondary}`}>
              For more detailed documentation, read the <a href="https://docs.f4rmhouse.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400">docs</a> or visit our <a href="https://github.com/f4rmhouse/f4rmhouse" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400">GitHub repository</a>.
            </p>
          </div>
          <div className={theme.textColorPrimary}>
            <h3 className="text-sm font-bold mb-3">FAQ</h3>
            <div className="space-y-4">
              {helpTopics.map((topic, index) => (
                <div key={index} className={`p-3 rounded-md ${theme.secondaryColor}`}>
                  <h4 className={`text-xs font-bold ${theme.textColorPrimary}`}>{topic.title}</h4>
                  <p className={`text-xs mt-1 ${theme.textColorSecondary}`}>{topic.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
