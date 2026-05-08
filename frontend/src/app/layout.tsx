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
import { SettingProvider } from "@/context/SettingContext";
import { SEOHandler } from "@/components/SEOHandler";

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
            <SettingProvider>
              <SEOHandler />
              {children}
              <Toaster position="top-right" richColors expand={true} />
            </SettingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
