"use client";

import { useEffect } from "react";

import { ThemeProvider } from "@/app/components/ThemeProvider";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { Toaster } from "@/app/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      console.error("[Tea] window error:", event.error || event.message);
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("[Tea] unhandled rejection:", event.reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="tea-theme">
        {children}
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
