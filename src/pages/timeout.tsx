import { useEffect } from "react";

// globals.d.ts or at the top of your component file
declare global {
  interface Window {
    inactivityTimeout?: ReturnType<typeof setTimeout>;
  }
}

const useActivityTimeout = (
  timeout: number = 300000,
  onTimeout: () => void
) => {
  useEffect(() => {
    const events: string[] = ["click", "mousemove", "keypress"];

    const resetTimer = () => {
      clearTimeout(window.inactivityTimeout);
      window.inactivityTimeout = setTimeout(onTimeout, timeout);
    };

    events.forEach((event) => window.addEventListener(event, resetTimer));
    return () => {
      clearTimeout(window.inactivityTimeout);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeout, onTimeout]);
};

export default useActivityTimeout;
