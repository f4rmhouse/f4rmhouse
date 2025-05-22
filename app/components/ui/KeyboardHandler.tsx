'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function KeyboardHandler() {
  const router = useRouter();
  // State to track if right sidebar is visible (to be shared across components)
  const [rightSidebarVisible, setRightSidebarVisible] = useState(false);
  
  useEffect(() => {
    let commandKeyPressed = false;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Tab key to focus the input field
      if (e.key === 'Tab' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault(); // Prevent default tab behavior
        
        // Find and focus the main input field
        const inputField = document.querySelector('.grow.z-10');
        if (inputField instanceof HTMLInputElement) {
          inputField.focus();
        }
      }
      
      // Check for Cmd+H to toggle between /store and home
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
        // Prevent default browser behavior (history)
        e.preventDefault();
        
        // Check current location and toggle between /store and home
        const currentPath = window.location.pathname;
        if (currentPath === '/store') {
          // If we're in the store, go to home
          router.push('/');
        } else {
          // If we're anywhere else, go to store
          router.push('/store');
        }
      }
      
      // Note: Cmd+M to toggle right sidebar is handled directly in RightSidebar.tsx
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Meta') {
        // commandKeyPressed = false;
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
