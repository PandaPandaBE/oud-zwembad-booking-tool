"use client";

import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState, type ReactNode } from "react";

// Query Client Provider
function QueryClientProviderWrapper({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Selected Date Context
interface SelectedDateContextType {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const SelectedDateContext = createContext<SelectedDateContextType | undefined>(
  undefined
);

function SelectedDateProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <SelectedDateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </SelectedDateContext.Provider>
  );
}

export function useSelectedDate() {
  const context = useContext(SelectedDateContext);
  if (context === undefined) {
    throw new Error(
      "useSelectedDate must be used within a SelectedDateProvider"
    );
  }
  return context;
}

// Main Providers component
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProviderWrapper>
      <SelectedDateProvider>{children}</SelectedDateProvider>
    </QueryClientProviderWrapper>
  );
}
