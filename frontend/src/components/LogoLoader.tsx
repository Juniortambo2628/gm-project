"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface LogoLoaderProps {
  className?: string;
  fullScreen?: boolean;
}

export function LogoLoader({ className, fullScreen = true }: LogoLoaderProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted && resolvedTheme === "dark"
    ? "/branding/GM-logo-dark-final.png"
    : "/branding/GM-logo-light-final.png";

  const content = (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <div className="relative">
        {/* Outer ring pulse */}
        <div className="absolute -inset-3 rounded-full border border-primary/15 animate-ping" />
        {/* Logo image with soft edges, shadow, no border */}
        <img
          src={logoSrc}
          alt="Loading"
          className="w-32 h-32 object-contain animate-[logoPulse_2s_ease-in-out_infinite] drop-shadow-[0_8px_24px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_8px_24px_rgba(255,255,255,0.08)] rounded-2xl"
          style={{ filter: "blur(0px)" }}
        />
      </div>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-colors">
      {content}
    </div>
  );
}
