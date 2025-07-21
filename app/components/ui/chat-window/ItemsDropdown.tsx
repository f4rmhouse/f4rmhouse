'use client';

import React from 'react';
import { Plus, X } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

type Item = {
  value: string
  decorator: string
}

interface ItemsDropdownProps {
  items: Item[];
  selectedItem: string | null | undefined;
  isVisible: boolean;
  title?: string;
  onItemSelect: (item: any) => void;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDelete?: (item: any) => void;
  onAdd?: () => void;
}

export default function ItemsDropdown({
  items,
  selectedItem,
  isVisible,
  title = "Select Item",
  onItemSelect,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onDelete,
  onAdd
}: ItemsDropdownProps) {
  const { theme } = useTheme();

  return (
    <div 
      className={`transition-opacity duration-200 z-50 min-w-0 sm:min-w-[200px] h-0 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } 
      /* Desktop: absolute positioned relative to parent */
      md:absolute md:top-0 md:left-0 md:transform-none md:translate-x-0 md:translate-y-0
      /* Mobile: fixed positioned and centered on screen */
      fixed`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`rounded-md shadow-lg ${theme.backgroundColor || 'bg-zinc-900'} ${theme.textColorPrimary || 'text-white'}`}>
        {/* Header with title and close button */}
        <div className={`flex items-center justify-between px-4`}>
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
          {items.map((item: Item, i:number) => (
            <div className='flex'>
            <button
              key={i}
              onClick={() => onItemSelect(item.value)}
              className={`flex w-full text-left px-4 py-2 text-xs hover:${theme.primaryColor || 'hover:bg-blue-600'} transition-colors ${
                selectedItem === item.value
                  ? `${theme.primaryColor || 'bg-blue-600'} ${theme.textColorPrimary || 'text-white'}` 
                  : `${theme.textColorSecondary || 'text-neutral-300'}`
              }`}
            >
              {item.decorator != undefined && item.decorator.length > 0 ?
                <img className='rounded-full mr-2 object-cover' width={15} height={15} src={item.decorator}/>
                :
                <></>
              }
              {item.value}
            </button>
            {onDelete &&
            <button onClick={() => onDelete(item)}><X size={16} /></button>
            }
            </div>
          ))}
          {onAdd &&
            <button onClick={() => onAdd()} className={`flex w-full justify-center items-center px-4 py-2 text-xs hover:${theme.primaryColor} transition-colors ${theme.textColorSecondary}`}><Plus size={16} /></button>
          }
        </div>
      </div>
    </div>
  );
}
