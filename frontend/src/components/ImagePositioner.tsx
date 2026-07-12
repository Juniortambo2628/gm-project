"use client";

import React, { useRef, useState, useCallback } from "react";
import { Move, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ImagePositionerProps {
  src: string;
  position: { x: number; y: number; mobile_x?: number; mobile_y?: number };
  onChange: (position: { x: number; y: number; mobile_x?: number; mobile_y?: number }) => void;
  className?: string;
}

export function ImagePositioner({ src, position, onChange, className }: ImagePositionerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");

  const currentX = mode === "desktop" ? position.x : (position.mobile_x ?? position.x);
  const currentY = mode === "desktop" ? position.y : (position.mobile_y ?? position.y);

  const calculatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

      if (mode === "desktop") {
        onChange({ ...position, x, y });
      } else {
        onChange({ ...position, mobile_x: x, mobile_y: y });
      }
    },
    [mode, position, onChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      calculatePosition(e.clientX, e.clientY);
    },
    [calculatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      calculatePosition(e.clientX, e.clientY);
    },
    [isDragging, calculatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Card className={cn("rounded-2xl border shadow-sm overflow-hidden bg-card", className)}>
      <div className="flex items-center justify-between p-4 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Move size={16} className="text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Focal Point Positioner
          </span>
        </div>
        <div className="flex items-center gap-1 bg-background rounded-lg border p-1">
          <Button
            variant={mode === "desktop" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("desktop")}
            className="h-7 px-3 rounded-md text-[10px] font-bold gap-1.5"
          >
            <Monitor size={12} /> Desktop
          </Button>
          <Button
            variant={mode === "mobile" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("mobile")}
            className="h-7 px-3 rounded-md text-[10px] font-bold gap-1.5"
          >
            <Smartphone size={12} /> Mobile
          </Button>
        </div>
      </div>

      <div className="p-4">
        <p className="text-[10px] text-muted-foreground font-medium mb-3">
          Click or drag to set the focal point for {mode} view. This controls which part of the image stays visible when cropped.
        </p>

        <div
          ref={containerRef}
          className={cn(
            "relative w-full aspect-video rounded-xl overflow-hidden cursor-crosshair border-2 transition-colors",
            isDragging ? "border-primary" : "border-border"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ touchAction: "none" }}
        >
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Position preview"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />

          {/* Crop overlay guides */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top crop zone */}
            <div
              className="absolute left-0 right-0 top-0 bg-black/30"
              style={{ height: `${currentY}%` }}
            />
            {/* Bottom crop zone */}
            <div
              className="absolute left-0 right-0 bottom-0 bg-black/30"
              style={{ height: `${100 - currentY}%` }}
            />
            {/* Left crop zone */}
            <div
              className="absolute left-0 bg-black/20"
              style={{
                top: `${currentY}%`,
                width: `${currentX}%`,
                height: "0px",
              }}
            />
            {/* Right crop zone */}
            <div
              className="absolute right-0 bg-black/20"
              style={{
                top: `${currentY}%`,
                width: `${100 - currentX}%`,
                height: "0px",
              }}
            />

            {/* Crosshair lines */}
            <div
              className="absolute top-0 bottom-0 w-px bg-white/50"
              style={{ left: `${currentX}%` }}
            />
            <div
              className="absolute left-0 right-0 h-px bg-white/50"
              style={{ top: `${currentY}%` }}
            />
          </div>

          {/* Focal point marker */}
          <div
            className={cn(
              "absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg transition-transform",
              isDragging ? "scale-125 bg-primary" : "bg-primary/80"
            )}
            style={{
              left: `${currentX}%`,
              top: `${currentY}%`,
            }}
          >
            <div className="absolute inset-1 rounded-full bg-white/30" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-muted-foreground">
          <span>
            {mode === "desktop" ? "Desktop" : "Mobile"} position: {currentX.toFixed(0)}%, {currentY.toFixed(0)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (mode === "desktop") {
                onChange({ ...position, x: 50, y: 50 });
              } else {
                onChange({ ...position, mobile_x: 50, mobile_y: 50 });
              }
            }}
            className="h-6 px-2 text-[10px] font-bold"
          >
            Reset to center
          </Button>
        </div>
      </div>
    </Card>
  );
}
