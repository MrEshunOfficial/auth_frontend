import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Script from "next/script";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { AuthInitializer } from "@/components/providers/AuthInitializer";
import { MainHeader } from "@/components/ui/headerUi/MainHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "errandmate",
  description: "errandmate team Incorporated",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 overflow-x-hidden`}
        suppressHydrationWarning
      >
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          async
        />
        <Script
          src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
          strategy="afterInteractive"
          async
        />

        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthInitializer>
              <main className="flex flex-col min-h-screen w-full">
                {/* Header */}
                <MainHeader />

                {/* Main content area */}
                <div className="flex-1 w-full max-w-screen-2xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
                  {children}
                </div>
              </main>
            </AuthInitializer>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
