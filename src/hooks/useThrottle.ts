import { useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        // Limpar timeout anterior se existir
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Programar execução para o final do período de throttle
        const remainingTime = delay - (now - lastRun.current);
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, remainingTime);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}