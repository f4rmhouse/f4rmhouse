'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function KeyboardHandler() {
  const router = useRouter();
  
  useEffect(() => {
    let commandKeyPressed = false;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the Command/Meta key is pressed
      if (e.key === 'Meta') {
        commandKeyPressed = true;
        
        // Clear any text selection
        if (window.getSelection) {
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
          }
        }
        
        // Blur any focused element
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
      
      // Check for Cmd+H to toggle between /store and home
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
        console.log(e.key)
        // Prevent default browser behavior (history)
        e.preventDefault();
        
        // Check current location and toggle between /store and home
        const currentPath = window.location.pathname;
        console.log(currentPath)
        if (currentPath === '/store') {
          // If we're in the store, go to home
          router.push('/');
        } else {
          // If we're anywhere else, go to store
          router.push('/store');
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Meta') {
        commandKeyPressed = false;
      }
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
}
