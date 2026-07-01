const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'frontend');

// 1. package.json
const pkg = {
  "name": "enterprise-ai-agent-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write ."
  },
  "dependencies": {
    "axios": "^1.7.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.370.0",
    "next": "^15.0.0",
    "next-themes": "^0.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.51.0",
    "recharts": "^2.12.0",
    "sonner": "^1.4.4",
    "tailwind-merge": "^2.3.0",
    "zod": "^3.23.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.32.0",
    "@tanstack/react-table": "^8.16.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "15.0.0",
    "postcss": "^8.4.38",
    "prettier": "^3.2.5",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.4.5"
  }
};
fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(pkg, null, 2));

// 2. tsconfig.json
const tsconfig = {
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
};
fs.writeFileSync(path.join(root, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

// 3. next.config.mjs
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;
`;
fs.writeFileSync(path.join(root, 'next.config.mjs'), nextConfig);

// 4. tailwind.config.ts / globals.css for v4
const globalsCss = `@import "tailwindcss";

@theme {
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));

  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));

  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));

  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));

  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));

  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));

  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
fs.writeFileSync(path.join(root, 'src', 'app', 'globals.css'), globalsCss);

// 5. shadcn components.json
const componentsJson = {
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
};
fs.writeFileSync(path.join(root, 'components.json'), JSON.stringify(componentsJson, null, 2));

// 6. Providers
const queryProvider = `"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
`;
fs.writeFileSync(path.join(root, 'src', 'providers', 'query-provider.tsx'), queryProvider);

const themeProvider = `"use client";

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
`;
fs.writeFileSync(path.join(root, 'src', 'providers', 'theme-provider.tsx'), themeProvider);

// update layout.tsx
const layoutTsx = `import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: 'Nexora AI',
  description: 'Manage and orchestrate AI agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
`;
fs.writeFileSync(path.join(root, 'src', 'app', 'layout.tsx'), layoutTsx);

// 7. Store
const storeIndex = `import { create } from 'zustand';

interface AppState {
  isInitialized: boolean;
  setInitialized: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitialized: false,
  setInitialized: (val) => set({ isInitialized: val }),
}));
`;
fs.writeFileSync(path.join(root, 'src', 'store', 'index.ts'), storeIndex);

// 8. Services / Axios
const axiosApi = `import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
`;
fs.writeFileSync(path.join(root, 'src', 'services', 'api', 'api.ts'), axiosApi);

const axiosInterceptors = `import { api } from './api';

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token etc here later
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here later
    return Promise.reject(error);
  }
);
`;
fs.writeFileSync(path.join(root, 'src', 'services', 'api', 'interceptors.ts'), axiosInterceptors);

// 9. Utils
const cnUtils = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
fs.mkdirSync(path.join(root, 'src', 'lib'), { recursive: true });
fs.writeFileSync(path.join(root, 'src', 'lib', 'utils.ts'), cnUtils);
fs.writeFileSync(path.join(root, 'src', 'utils', 'cn.ts'), cnUtils);

const classNameUtils = `export const mergeClasses = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};
`;
fs.writeFileSync(path.join(root, 'src', 'utils', 'className.ts'), classNameUtils);

const formatUtils = `export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
};
`;
fs.writeFileSync(path.join(root, 'src', 'utils', 'format.ts'), formatUtils);

const constantsIndex = `export const APP_NAME = "Nexora AI";
export const API_VERSION = "v1";
`;
fs.writeFileSync(path.join(root, 'src', 'constants', 'index.ts'), constantsIndex);

// 10. Env
const envLocal = `NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_ENV=development
`;
fs.writeFileSync(path.join(root, '.env.local.example'), envLocal);

// 11. ESLint & Prettier
const eslintRc = `{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off"
  }
}
`;
fs.writeFileSync(path.join(root, '.eslintrc.json'), eslintRc);

const prettierRc = `{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
`;
fs.writeFileSync(path.join(root, '.prettierrc'), prettierRc);

// Create tailwind config just in case it's needed by Shadcn cli
const twConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
fs.writeFileSync(path.join(root, 'tailwind.config.ts'), twConfig);

console.log("Configuration created successfully");
