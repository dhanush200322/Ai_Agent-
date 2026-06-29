const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'frontend', 'src');

const files = {
  // ThemeProvider
  'providers/ThemeProvider.tsx': `"use client";\n\nimport * as React from "react";\nimport { ThemeProvider as NextThemesProvider } from "next-themes";\n\nexport function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {\n  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;\n}\n`,

  // QueryProvider
  'providers/QueryProvider.tsx': `"use client";\n\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\nimport { useState } from 'react';\n\nexport function QueryProvider({ children }: { children: React.ReactNode }) {\n  const [queryClient] = useState(\n    () =>\n      new QueryClient({\n        defaultOptions: {\n          queries: {\n            staleTime: 60 * 1000,\n            retry: 1,\n            refetchOnWindowFocus: false,\n          },\n          mutations: {\n            retry: 0,\n          },\n        },\n      })\n  );\n\n  return (\n    <QueryClientProvider client={queryClient}>\n      {children}\n    </QueryClientProvider>\n  );\n}\n`,

  // AuthProvider
  'providers/AuthProvider.tsx': `"use client";\n\nimport React, { createContext, useContext, useState } from 'react';\n\ntype User = {\n  id: string;\n  name: string;\n  email: string;\n};\n\ntype AuthContextType = {\n  user: User | null;\n  session: string | null;\n  isAuthenticated: boolean;\n  isLoading: boolean;\n};\n\nconst AuthContext = createContext<AuthContextType | undefined>(undefined);\n\nexport function AuthProvider({ children }: { children: React.ReactNode }) {\n  const [user, setUser] = useState<User | null>(null);\n  const [session, setSession] = useState<string | null>(null);\n  const [isLoading, setIsLoading] = useState(false);\n\n  return (\n    <AuthContext.Provider\n      value={{\n        user,\n        session,\n        isAuthenticated: !!user,\n        isLoading,\n      }}\n    >\n      {children}\n    </AuthContext.Provider>\n  );\n}\n\nexport const useAuth = () => {\n  const context = useContext(AuthContext);\n  if (context === undefined) {\n    throw new Error('useAuth must be used within an AuthProvider');\n  }\n  return context;\n};\n`,

  // StoreProvider
  'providers/StoreProvider.tsx': `"use client";\n\nimport React, { createContext, useContext, useRef } from 'react';\nimport { useAppStore } from '@/store';\n\n// Placeholder context to demonstrate a store provider if strictly needed.\n// Zustand doesn't require a Context Provider by default, but this satisfies the architecture.\nconst StoreContext = createContext<typeof useAppStore | undefined>(undefined);\n\nexport function StoreProvider({ children }: { children: React.ReactNode }) {\n  const storeRef = useRef(useAppStore);\n\n  return (\n    <StoreContext.Provider value={storeRef.current}>\n      {children}\n    </StoreContext.Provider>\n  );\n}\n\nexport const useStoreContext = () => {\n  const context = useContext(StoreContext);\n  if (context === undefined) {\n    throw new Error('useStoreContext must be used within a StoreProvider');\n  }\n  return context;\n};\n`,

  // ToastProvider
  'providers/ToastProvider.tsx': `"use client";\n\nimport { Toaster } from "sonner";\n\nexport function ToastProvider() {\n  return (\n    <Toaster \n      position="top-right"\n      richColors\n      closeButton\n    />\n  );\n}\n`,

  // Providers Compose
  'providers/Providers.tsx': `"use client";\n\nimport * as React from "react";\nimport { ThemeProvider } from "./ThemeProvider";\nimport { QueryProvider } from "./QueryProvider";\nimport { AuthProvider } from "./AuthProvider";\nimport { StoreProvider } from "./StoreProvider";\nimport { ToastProvider } from "./ToastProvider";\n\nexport function Providers({ children }: { children: React.ReactNode }) {\n  return (\n    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>\n      <QueryProvider>\n        <StoreProvider>\n          <AuthProvider>\n            {children}\n            <ToastProvider />\n          </AuthProvider>\n        </StoreProvider>\n      </QueryProvider>\n    </ThemeProvider>\n  );\n}\n`,

  // GlobalLoading
  'components/common/GlobalLoading.tsx': `export function GlobalLoading() {\n  return (\n    <div className="flex h-screen w-screen items-center justify-center bg-background/50">\n      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />\n    </div>\n  );\n}\n`,

  // GlobalErrorBoundary
  'components/common/GlobalErrorBoundary.tsx': `"use client";\n\nimport React from "react";\n\ninterface ErrorBoundaryProps {\n  children: React.ReactNode;\n}\n\ninterface ErrorBoundaryState {\n  hasError: boolean;\n  error: Error | null;\n}\n\nexport class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {\n  constructor(props: ErrorBoundaryProps) {\n    super(props);\n    this.state = { hasError: false, error: null };\n  }\n\n  static getDerivedStateFromError(error: Error): ErrorBoundaryState {\n    return { hasError: true, error };\n  }\n\n  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {\n    console.error("Global Error Caught:", error, errorInfo);\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return (\n        <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground">\n          <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>\n          <p className="text-muted-foreground">{this.state.error?.message}</p>\n        </div>\n      );\n    }\n\n    return this.props.children;\n  }\n}\n`,

  // Layout
  'app/layout.tsx': `import { Providers } from "@/providers/Providers";\nimport "./globals.css";\n\nexport const metadata = {\n  title: 'Enterprise AI Agent Platform',\n  description: 'Manage and orchestrate AI agents',\n};\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode;\n}) {\n  return (\n    <html lang="en" suppressHydrationWarning>\n      <body className="min-h-screen bg-background font-sans antialiased">\n        <Providers>\n          {children}\n        </Providers>\n      </body>\n    </html>\n  );\n}\n`
};

Object.entries(files).forEach(([f, content]) => {
  const filePath = path.join(root, f);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
});

console.log("Providers configuration generated");
