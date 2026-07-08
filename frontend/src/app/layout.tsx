import { Providers } from "@/providers/Providers";
import { SmoothScroll } from "@/components/common/SmoothScroll";
import { Inter, Space_Grotesk } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

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
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <SmoothScroll>
          <Providers>
            {children}
          </Providers>
        </SmoothScroll>
      </body>
    </html>
  );
}
