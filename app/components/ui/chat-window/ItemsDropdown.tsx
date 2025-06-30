'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import F4rmerType from '@/app/components/types/F4rmerType';

interface ItemsDropdownProps {
  items: string[];
  selectedItem: string | null | undefined;
  isVisible: boolean;
  title?: string;
  onItemSelect: (item: any) => void;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function ItemsDropdown({
  items,
  selectedItem,
  isVisible,
  title = "Select Item",
  onItemSelect,
  onClose,
  onMouseEnter,
  onMouseLeave
}: ItemsDropdownProps) {
  const { theme } = useTheme();

  return (
    <div 
      className={`transition-opacity duration-200 z-50 min-w-[200px] ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } 
      /* Desktop: absolute positioned relative to parent */
      md:absolute md:top-0 md:left-0 md:transform-none md:translate-x-0 md:translate-y-0
      /* Mobile: fixed positioned and centered on screen */
      fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`rounded-md shadow-lg border ${theme.backgroundColor || 'bg-zinc-900'} ${theme.textColorPrimary || 'text-white'} border-neutral-700`}>
        {/* Header with title and close button */}
        <div className={`flex items-center justify-between px-4 border-b border-neutral-700`}>
          <h3 className={`text-xs font-medium ${theme.textColorPrimary || 'text-white'}`}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-md hover:${theme.primaryColor || 'hover:bg-blue-600'} transition-colors ${theme.textColorSecondary || 'text-neutral-400'} hover:${theme.textColorPrimary || 'hover:text-white'}`}
            aria-label="Close dropdown"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Items list */}
        <div className="py-1">
          {items.map((item: string, i:number) => (
            <button
              key={i}
              onClick={() => onItemSelect(item)}
              className={`w-full text-left px-4 py-2 text-xs hover:${theme.primaryColor || 'hover:bg-blue-600'} transition-colors ${
                selectedItem === item
                  ? `${theme.primaryColor || 'bg-blue-600'} ${theme.textColorPrimary || 'text-white'}` 
                  : `${theme.textColorSecondary || 'text-neutral-300'}`
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
