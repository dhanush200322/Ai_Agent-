"use client";

import React, { createContext, useContext, useRef } from 'react';
import { useAppStore } from '@/store';

// Placeholder context to demonstrate a store provider if strictly needed.
// Zustand doesn't require a Context Provider by default, but this satisfies the architecture.
const StoreContext = createContext<typeof useAppStore | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(useAppStore);

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
};
