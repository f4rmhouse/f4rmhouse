'use client'

import { useState, useEffect } from "react"
import Modal from "./Modal"
import F4rmerType from "../../types/F4rmerType"
import ProductType from "../../types/ProductType"
import { Check, Plus } from "lucide-react"
import { useAgent } from "@/app/context/AgentContext"

interface F4rmerSelectModalProps {
  open: boolean
  onClose: () => void
  product: ProductType | null
  onAddToF4rmer: (f4rmerId: string) => void
}

export default function F4rmerSelectModal({ open, onClose, product, onAddToF4rmer }: F4rmerSelectModalProps) {
  const { availableAgents } = useAgent();
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
        <h3 className="text-sm font-semibold text-white mb-4">
          Select a F4rmer to add {product?.title} to:
        </h3>

        {availableAgents.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-neutral-400 text-sm mb-2">You don't have any F4rmers yet</p>
            <a 
              href="/dashboard/create/f4rmer" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-4 rounded-md transition-colors"
            >
              Create your first F4rmer
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {availableAgents.map((f4rmer) => (
                <div 
                  key={f4rmer.uid}
                  onClick={() => setSelectedF4rmer(f4rmer.uid)}
                  className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
                    selectedF4rmer === f4rmer.uid 
                      ? 'bg-blue-600 bg-opacity-20 border border-blue-500' 
                      : 'bg-zinc-800 hover:bg-zinc-700 border border-transparent'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-medium text-white">{f4rmer.title}</h4>
                    <p className="text-xs text-neutral-400 mt-1">{f4rmer.toolbox.length} tools</p>
                  </div>
                  {selectedF4rmer === f4rmer.uid && (
                    <Check size={16} className="text-blue-400" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-300 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddToF4rmer}
                disabled={!selectedF4rmer}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-colors flex items-center ${
                  selectedF4rmer 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                    : 'bg-yellow-500 bg-opacity-50 text-neutral-300 cursor-not-allowed'
                }`}
              >
                <Plus size={14} className="mr-1" />
                Add to F4rmer
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
