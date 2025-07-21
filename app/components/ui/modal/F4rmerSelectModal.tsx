'use client'

import { useState, useEffect } from "react"
import Modal from "./Modal"
import F4rmerType from "../../types/F4rmerType"
import ProductType from "../../types/ProductType"
import { Check, Plus } from "lucide-react"
import { useAgent } from "@/app/context/AgentContext"
import { useTheme } from "@/app/context/ThemeContext"

interface F4rmerSelectModalProps {
  open: boolean
  onClose: () => void
  product: ProductType | null
  onAddToF4rmer: (f4rmerId: string) => void
}

export default function F4rmerSelectModal({ open, onClose, product, onAddToF4rmer }: F4rmerSelectModalProps) {
  const { availableAgents } = useAgent();
  const { theme } = useTheme();
  const [selectedF4rmer, setSelectedF4rmer] = useState<string | null>(null)

  // Reset selection when modal opens
  useEffect(() => {
    if (open) {
      setSelectedF4rmer(null)
    }
  }, [open])

  const handleAddToF4rmer = () => {
    if (selectedF4rmer) {
      onAddToF4rmer(selectedF4rmer)
      onClose()
    }
  }

  return (
    <Modal 
      open={open} 
      title="Add to F4rmer Toolbox"
      onClose={onClose}
    >
      <div className="p-4">
        <h3 className={`text-sm font-semibold mb-4 ${theme.textColorPrimary}`}>
          Select a profile to add {product?.title} to:
        </h3>

        {availableAgents.length === 0 ? (
          <div className="text-center py-6">
            <p className={`text-sm mb-2 ${theme.textColorSecondary}`}>You don't have any profiles yet</p>
            <a 
              href="/dashboard/create/f4rmer" 
              className={`inline-block text-xs font-medium py-2 px-4 rounded-md transition-colors ${theme.accentColor} ${theme.textColorPrimary}`}
            >
              Create your first profile 
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {availableAgents.map((f4rmer) => (
                <div 
                  key={f4rmer.uid}
                  onClick={() => setSelectedF4rmer(f4rmer.uid)}
                  className={`p-3 rounded-md cursor-pointer flex items-center justify-between border border-transparent hover:${theme.hoverColor.replace("bg-", "border-")} transition-colors`}
                >
                  <div>
                    <h4 className={`text-sm font-medium ${theme.textColorPrimary}`}>{f4rmer.title}</h4>
                    <p className={`text-xs mt-1 ${theme.textColorSecondary}`}>{f4rmer.toolbox.length} tools</p>
                  </div>
                  {selectedF4rmer === f4rmer.uid && (
                    <Check size={16} style={{ color: theme.accentColor }} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button 
                onClick={onClose}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-colors ${theme.textColorSecondary}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddToF4rmer}
                disabled={!selectedF4rmer}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-colors flex items-center ${
                  selectedF4rmer 
                    ? theme.textColorPrimary
                    : `${theme.textColorSecondary} cursor-not-allowed`
                }`}
              >
                <Plus size={14} className="mr-1" />
                Add to profile
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
