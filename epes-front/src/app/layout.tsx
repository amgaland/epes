import "./globals.css";
import { constructMetadata } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./page";

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={<Skeleton />}>
              <AppSidebar />
              <main>{children}</main>
            </Suspense>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
