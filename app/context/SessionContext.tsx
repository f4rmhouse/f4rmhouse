"use client"
import { createContext, useContext } from 'react';
// import { Session } from "next-auth";

import F4Session from '../components/types/F4Session';

export const SessionContext = createContext<F4Session | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: F4Session;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}