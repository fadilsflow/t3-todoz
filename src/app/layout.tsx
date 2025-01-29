import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "t3-todoz",
  description: "simple todoz apps use t3",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`} suppressHydrationWarning>
      <body>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster/>
        </ThemeProvider>
      </body>
    </html>
  );
}
