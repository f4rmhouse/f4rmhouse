'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useKeyboardShortcuts } from '../../utils/keyboardShortcuts'

export default function KeyboardHandler() {
  const router = useRouter();
  
  // Global keyboard shortcuts
  const { registerShortcuts, cleanup } = useKeyboardShortcuts({
    TOGGLE_STORE_HOME: {
      key: 'h',
      metaKey: true,
      preventDefault: true,
      callback: () => {
        const currentPath = window.location.pathname;
        if (currentPath === '/store') {
          router.push('/');
        } else {
          router.push('/store');
        }
      },
    },
    FOCUS_INPUT: {
      key: 'Tab',
      preventDefault: true,
      callback: () => {
        const inputField = document.querySelector('.grow.z-10');
        if (inputField instanceof HTMLInputElement) {
          inputField.focus();
        }
      },
    },
    TOGGLE_LEFT_SIDEBAR: {
      key: 'b',
      metaKey: true,
      preventDefault: true,
      callback: () => {
        // Dispatch custom event for sidebar toggle
        document.dispatchEvent(new CustomEvent('toggleLeftSidebar'));
      },
    },
    TOGGLE_RIGHT_SIDEBAR: {
      key: 'm',
      metaKey: true,
      preventDefault: true,
      callback: () => {
        // Dispatch custom event for sidebar toggle
        document.dispatchEvent(new CustomEvent('toggleRightSidebar'));
      },
    },
    OPEN_AGENT_SELECTOR: {
      key: 'a',
      metaKey: true,
      preventDefault: true,
      callback: () => {
        // Dispatch custom event for agent selector
        document.dispatchEvent(new CustomEvent('openAgentSelector'));
      },
    },
  });
  
  useEffect(() => {
    registerShortcuts();
    return cleanup;
  }, []);
  
  // This component doesn't render anything visible
  return null;
}
