import React, { createContext, useContext, useMemo, ReactNode } from 'react';

interface TarotPerformanceContextType {
  memoizedComponents: Map<string, React.ComponentType<any>>;
  optimizedCallbacks: Map<string, (...args: any[]) => any>;
}

const TarotPerformanceContext = createContext<TarotPerformanceContextType | null>(null);

export const useTarotPerformance = () => {
  const context = useContext(TarotPerformanceContext);
  if (!context) {
    throw new Error('useTarotPerformance must be used within TarotPerformanceProvider');
  }
  return context;
};

interface TarotPerformanceProviderProps {
  children: ReactNode;
}

export const TarotPerformanceProvider: React.FC<TarotPerformanceProviderProps> = ({ children }) => {
  const value = useMemo<TarotPerformanceContextType>(() => ({
    memoizedComponents: new Map(),
    optimizedCallbacks: new Map(),
  }), []);

  return (
    <TarotPerformanceContext.Provider value={value}>
      {children}
    </TarotPerformanceContext.Provider>
  );
};