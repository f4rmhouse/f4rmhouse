/**
 * Keyboard shortcuts utility for the F4rmhouse application
 * Centralizes all keyboard shortcut handling logic
 */

export interface KeyboardShortcutConfig {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  preventDefault?: boolean;
  callback: () => void;
}

export class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcutConfig> = new Map();
  private isListening = false;

  /**
   * Register a keyboard shortcut
   */
  register(id: string, config: KeyboardShortcutConfig) {
    this.shortcuts.set(id, config);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(id: string) {
    this.shortcuts.delete(id);
  }

  /**
   * Start listening for keyboard events
   */
  startListening() {
    if (this.isListening) return;
    
    window.addEventListener('keydown', this.handleKeyDown);
    this.isListening = true;
  }

  /**
   * Stop listening for keyboard events
   */
  stopListening() {
    if (!this.isListening) return;
    
    window.removeEventListener('keydown', this.handleKeyDown);
    this.isListening = false;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Skip if user is typing in an input field or textarea
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    for (const [id, config] of this.shortcuts) {
      if (this.matchesShortcut(e, config)) {
        if (config.preventDefault) {
          e.preventDefault();
        }
        config.callback();
        break;
      }
    }
  };

  private matchesShortcut(e: KeyboardEvent, config: KeyboardShortcutConfig): boolean {
    const keyMatches = e.key.toLowerCase() === config.key.toLowerCase();
    const metaMatches = !!config.metaKey === (e.metaKey || e.ctrlKey);
    const ctrlMatches = config.ctrlKey === undefined || config.ctrlKey === e.ctrlKey;
    const shiftMatches = config.shiftKey === undefined || config.shiftKey === e.shiftKey;
    const altMatches = config.altKey === undefined || config.altKey === e.altKey;

    return keyMatches && metaMatches && ctrlMatches && shiftMatches && altMatches;
  }

  /**
   * Clean up all shortcuts and stop listening
   */
  destroy() {
    this.stopListening();
    this.shortcuts.clear();
  }
}

// Predefined shortcut configurations
export const createCommonShortcuts = () => ({
  TOGGLE_SIDEBAR_LEFT: {
    key: 'b',
    metaKey: true,
    preventDefault: true,
  },
  TOGGLE_SIDEBAR_RIGHT: {
    key: 'm',
    metaKey: true,
    preventDefault: true,
  },
  TOGGLE_STORE_HOME: {
    key: 'h',
    metaKey: true,
    preventDefault: true,
  },
  OPEN_AGENT_SELECTOR: {
    key: 'a',
    metaKey: true,
    preventDefault: true,
  },
  TOGGLE_CANVAS: {
    key: 'o',
    metaKey: true,
    preventDefault: true,
  },
  CLEAR_CHAT: {
    key: 'x',
    metaKey: true,
    preventDefault: true,
  },
  FOCUS_INPUT: {
    key: 'Tab',
    preventDefault: true,
  },
});

// Hook for using keyboard shortcuts in React components
export const useKeyboardShortcuts = (shortcuts: Record<string, Omit<KeyboardShortcutConfig, 'callback'> & { callback: () => void }>) => {
  const manager = new KeyboardShortcutManager();

  const registerShortcuts = () => {
    Object.entries(shortcuts).forEach(([id, config]) => {
      manager.register(id, config);
    });
    manager.startListening();
  };

  const cleanup = () => {
    manager.destroy();
  };

  return { registerShortcuts, cleanup };
};
