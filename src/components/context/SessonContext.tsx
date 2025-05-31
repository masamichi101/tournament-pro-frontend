// components/context/SessionContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";

export const SessionContext = createContext<{ sessionId: string | null }>({ sessionId: null });

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let stored = sessionStorage.getItem("editorSessionId");
    if (!stored) {
      stored = crypto.randomUUID();
      sessionStorage.setItem("editorSessionId", stored);
    }
    setSessionId(stored);
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

// カスタムフックで簡単に取り出せるように
export const useSessionId = () => useContext(SessionContext);
