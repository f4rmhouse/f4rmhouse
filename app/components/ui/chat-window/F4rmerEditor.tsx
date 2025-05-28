import { useEffect, useState } from 'react';
import F4rmerType from '../../types/F4rmerType';
import { useTheme } from '../../../context/ThemeContext';

interface F4rmerEditorProps {
  f4rmer: F4rmerType | undefined;
  isVisible: boolean;
  onClose: () => void;
  onSave: (updatedF4rmer: F4rmerType) => void;
}

/**
 * F4rmerEditor provides an interface for editing a f4rmer's properties
 */
export default function F4rmerEditor({ f4rmer, isVisible, onClose, onSave }: F4rmerEditorProps) {
  const { theme } = useTheme();
  
  // Local state for form values
  const [title, setTitle] = useState<string>(f4rmer?.title || '');
  const [jobDescription, setJobDescription] = useState<string>(f4rmer?.jobDescription || '');
  
  // Update local state when f4rmer changes
  useEffect(() => {
    if (f4rmer) {
      setTitle(f4rmer.title);
      setJobDescription(f4rmer.jobDescription);
    }
  }, [f4rmer]);
  
  const handleSave = () => {
    if (!f4rmer) return;
    
    const updatedF4rmer: F4rmerType = {
      ...f4rmer,
      title,
      jobDescription
    };
    
    onSave(updatedF4rmer);
  };
  
  return (
    <div className={`absolute right-[2%] w-[25%] mr-auto ${theme.secondaryColor || "bg-neutral-700"} p-4 transition-all duration-300 ease-in-out ${theme.textColorPrimary || "text-white"} rounded-md shadow-lg ${!isVisible ? "opacity-0 -translate-y-full invisible" : "opacity-100 translate-y-0 visible"}`}>
      <p className={`text-xl font-medium mb-3 ${theme.textColorPrimary || "text-white"}`}>Edit f4rmer</p>
      <div className="space-y-3">
        <div>
          <label className={`text-sm font-medium ${theme.textColorSecondary || "text-neutral-400"} block mb-1`}>F4rmer name</label>
          <input 
            className={`w-full px-4 py-2 ${theme.primaryColor || "bg-neutral-800/50"} border ${theme.secondaryColor?.replace("bg-", "border-") || "border-neutral-800"} rounded-md transition-all`} 
            type="text" 
            placeholder="Enter f4rmer name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className={`text-sm font-medium ${theme.textColorSecondary || "text-neutral-400"} block mb-1`}>System prompt</label>
          <textarea 
            className={`w-full px-4 py-2 ${theme.primaryColor || "bg-neutral-800/50"} border ${theme.secondaryColor?.replace("bg-", "border-") || "border-neutral-800"} rounded-md transition-all min-h-[120px]`}
            placeholder="Write the f4rmer's system prompt here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={20}
          />
        </div>
        <div className="flex justify-between mt-4">
          <button 
            onClick={onClose}
            className={`cursor-pointer transition-all hover:opacity-80 rounded-md font-medium text-sm bg-neutral-800 py-2 px-6`}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className={`cursor-pointer transition-all ${theme.accentColor || "bg-neutral-500"} hover:${theme.hoverColor || "bg-neutral-600"} py-2 px-6 rounded-md font-medium text-sm`}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
