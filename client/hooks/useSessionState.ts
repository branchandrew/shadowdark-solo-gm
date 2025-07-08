import { useState, useEffect, useRef } from "react";

/**
 * Hook for persisting state across tab switches during a browser session.
 * State is preserved when switching tabs but cleared on app restart.
 * Perfect for development mode where we want fresh state on restart
 * but convenience when navigating between tabs.
 */
export function useSessionState<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Use a ref to track if this is the initial mount
  const isInitialMount = useRef(true);

  // Initialize state
  const [state, setState] = useState<T>(() => {
    try {
      // Only try to restore from sessionStorage on initial mount
      const item = sessionStorage.getItem(`session_state_${key}`);
      if (item) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.warn(`Failed to restore session state for ${key}:`, error);
    }
    return initialValue;
  });

  // Save to sessionStorage whenever state changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    try {
      sessionStorage.setItem(`session_state_${key}`, JSON.stringify(state));
    } catch (error) {
      console.warn(`Failed to save session state for ${key}:`, error);
    }
  }, [key, state]);

  return [state, setState];
}

/**
 * Clear all session state (useful for development reset)
 */
export function clearAllSessionState(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("session_state_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
    console.log("Cleared all session state");
  } catch (error) {
    console.warn("Failed to clear session state:", error);
  }
}
