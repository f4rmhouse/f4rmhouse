import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import NavButtonGroup from "./components/ui/navbar/NavButtonGroup"
import { SessionProvider } from 'next-auth/react'
import { PHProvider } from './providers'
import { ThemeProvider } from "./context/ThemeContext";
import { ArtifactProvider } from "./context/ArtifactContext";
import { AgentProvider } from "./context/AgentContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import config from "../f4.config"
import KeyboardHandlerWrapper from "./components/ui/KeyboardHandlerWrapper";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "f4rmhouse",
  description: "the browser-native MCP client",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode}>) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/public/icon.ico" sizes="any" />
      </head>
      <PHProvider>
      <SessionProvider>
        <ThemeProvider>
          <OnboardingProvider>
            <AgentProvider>
            <body>
              <ArtifactProvider>
              <KeyboardHandlerWrapper />
              <div className="min-h-screen">
                {
                <nav className="fixed z-10 w-[100vw] border-b border-neutral-700 bg-black">
                  <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
                    <div>
                      <Link href="/" className="text-xs sm:text-sm">{config.name}</Link>
                    </div>
                    <div>
                      <NavButtonGroup />
                    </div>
                  </div>
                </nav>
                }
                <div>
                  <Toaster />
                  {children}
                </div>
              </div>
              </ArtifactProvider>
            </body>
            </AgentProvider>
          </OnboardingProvider>
        </ThemeProvider>
        </SessionProvider>
        </PHProvider>
    </html>
  );
}
