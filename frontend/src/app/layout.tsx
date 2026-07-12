import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Gathoni Mwai | African MBA & Consulting Coach",
  description: "Helping Africans access the world's best MBA opportunities and land top-tier consulting roles.",
  icons: {
    icon: "/favicon.png",
  },
};

import { Toaster } from 'sonner';

import { AuthProvider } from "@/context/AuthContext";
import { SiteDataProvider } from "@/context/SiteDataContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { CMSContentProvider } from "@/context/CMSContentContext";
import { SEOHandler } from "@/components/SEOHandler";
import { ApiStatusBanner } from "@/components/ApiStatusBanner";
import { SiteDataGate } from "@/components/SiteDataGate";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="http://localhost:8000" />
      </head>
      <body 
        className="w-full flex flex-col bg-background text-foreground transition-colors duration-300"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SiteDataProvider>
              <SiteSettingsProvider>
                <CMSContentProvider>
                  <SEOHandler />
                  <ApiStatusBanner />
                  <SiteDataGate>
                    {children}
                  </SiteDataGate>
                  <Toaster position="top-right" richColors expand={true} />
                </CMSContentProvider>
              </SiteSettingsProvider>
            </SiteDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
