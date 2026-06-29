"use client";

import * as React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { StoreProvider } from "./StoreProvider";
import { ToastProvider } from "./ToastProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
      <QueryProvider>
        <StoreProvider>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </StoreProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
