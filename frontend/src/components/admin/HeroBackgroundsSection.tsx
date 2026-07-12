"use client";

import React, { useMemo, useCallback, useState } from "react";
import { Smartphone, Monitor, Move } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { updateImagePosition, type ImagePosition, getErrorMessage } from "@/lib/api";

const FilePondUploader = dynamic(
  () => import("@/components/admin/FilePondUploader"),
  { ssr: false }
);

interface HeroBackgroundConfig {
  key: string;
  label: string;
  hasPosition?: boolean;
  hasMobile?: boolean;
}

interface HeroBackgroundsSectionProps {
  backgrounds: HeroBackgroundConfig[];
  localSettings: Record<string, string>;
  setLocalSettings: (settings: Record<string, string>) => void;
  setSaving: (saving: boolean) => void;
}

export default function HeroBackgroundsSection({
  backgrounds,
  localSettings,
  setLocalSettings,
  setSaving,
}: HeroBackgroundsSectionProps) {
  const positions = useMemo(() => {
    const loaded: Record<string, ImagePosition> = {};
    backgrounds.forEach((bg) => {
      if (bg.hasPosition) {
        try {
          const raw = localSettings[`${bg.key}_position`];
          if (raw) {
            loaded[bg.key] = typeof raw === "string" ? JSON.parse(raw) : raw;
          } else {
            loaded[bg.key] = { x: 50, y: 50, mobile_x: 50, mobile_y: 50 };
          }
        } catch {
          loaded[bg.key] = { x: 50, y: 50, mobile_x: 50, mobile_y: 50 };
        }
      }
    });
    return loaded;
  }, [localSettings, backgrounds]);

  const handlePositionChange = useCallback(
    async (key: string, position: ImagePosition) => {
      try {
        await updateImagePosition(key, position);
        setLocalSettings({
          ...localSettings,
          [`${key}_position`]: JSON.stringify(position),
        });
      } catch (err) {
        toast.error("Failed to save position", { description: getErrorMessage(err) });
      }
    },
    [localSettings, setLocalSettings]
  );

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2">
        <Smartphone size={16} /> Page Backgrounds (Desktop + Mobile)
      </h4>
      <div className="h-[600px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
        {backgrounds.map((bg) => {
          const isVideo =
            localSettings[bg.key] &&
            localSettings[bg.key].match(/\.(mp4|webm|ogg)$/i);
          const hasPosition = bg.hasPosition && !isVideo;
          const position = positions[bg.key] || { x: 50, y: 50 };

          return (
            <div
              key={bg.key}
              className="p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10 space-y-4"
            >
              {/* Desktop uploader */}
              <FilePondUploader
                uploadKey={bg.key}
                label={`${bg.label} (Desktop)`}
                onSuccess={(url) =>
                  setLocalSettings({ ...localSettings, [bg.key]: url })
                }
                onProcessFile={() => setSaving(true)}
                onProcessFileEnd={() => setSaving(false)}
                acceptedFileTypes={["image/*", "video/*"]}
                currentValue={localSettings[bg.key]}
              />

              {/* Mobile uploader (if configured) */}
              {bg.hasMobile && (
                <div className="pl-4 border-l-2 border-primary/20">
                  <FilePondUploader
                    uploadKey={`${bg.key}_mobile`}
                    label={`${bg.label} (Mobile)`}
                    onSuccess={(url) =>
                      setLocalSettings({
                        ...localSettings,
                        [`${bg.key}_mobile`]: url,
                      })
                    }
                    onProcessFile={() => setSaving(true)}
                    onProcessFileEnd={() => setSaving(false)}
                    acceptedFileTypes={["image/*", "video/*"]}
                    currentValue={localSettings[`${bg.key}_mobile`]}
                  />
                </div>
              )}

              {/* Focal point positioner (images only) */}
              {hasPosition && localSettings[bg.key] && (
                <div className="pl-4 border-l-2 border-primary/20">
                  <PositionControls
                    src={getResolvedUrl(localSettings[bg.key])}
                    position={position}
                    onChange={(pos) => handlePositionChange(bg.key, pos)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PositionControls({
  src,
  position,
  onChange,
}: {
  src: string;
  position: ImagePosition;
  onChange: (pos: ImagePosition) => void;
}) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handlePointerUp = useCallback(() => setIsDragging(false), []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Move size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Focal Point
          </span>
        </div>
        <div className="flex items-center gap-1 bg-background rounded-lg border p-1">
          <button
            onClick={() => setMode("desktop")}
            className={`h-6 px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
              mode === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor size={10} /> Desktop
          </button>
          <button
            onClick={() => setMode("mobile")}
            className={`h-6 px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
              mode === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone size={10} /> Mobile
          </button>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground font-medium">
        Click or drag to set the focal point for {mode} view.
      </p>

      <div
        ref={containerRef}
        className={`relative w-full aspect-video rounded-xl overflow-hidden cursor-crosshair border-2 transition-colors ${
          isDragging ? "border-primary" : "border-border"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: "none" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Position preview"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />

        {/* Crop overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 right-0 top-0 bg-black/30" style={{ height: `${currentY}%` }} />
          <div className="absolute left-0 right-0 bottom-0 bg-black/30" style={{ height: `${100 - currentY}%` }} />
          <div className="absolute top-0 bottom-0 w-px bg-white/50" style={{ left: `${currentX}%` }} />
          <div className="absolute left-0 right-0 h-px bg-white/50" style={{ top: `${currentY}%` }} />
        </div>

        {/* Focal point marker */}
        <div
          className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg transition-transform ${
            isDragging ? "scale-125 bg-primary" : "bg-primary/80"
          }`}
          style={{ left: `${currentX}%`, top: `${currentY}%` }}
        >
          <div className="absolute inset-1 rounded-full bg-white/30" />
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
        <span>
          {mode === "desktop" ? "Desktop" : "Mobile"}: {currentX.toFixed(0)}%, {currentY.toFixed(0)}%
        </span>
        <button
          onClick={() => {
            if (mode === "desktop") {
              onChange({ ...position, x: 50, y: 50 });
            } else {
              onChange({ ...position, mobile_x: 50, mobile_y: 50 });
            }
          }}
          className="text-[10px] font-bold text-primary hover:underline"
        >
          Reset to center
        </button>
      </div>
    </div>
  );
}

function getResolvedUrl(val: string): string {
  if (!val) return "";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  if (val.startsWith("/storage") || val.startsWith("storage")) {
    const base = apiUrl.replace(/\/api$/, "");
    const normalizedPath = val.startsWith("/") ? val : "/" + val;
    return `${base}${normalizedPath}`;
  }

  if (val.startsWith("http://") || val.startsWith("https://")) {
    try {
      const urlObj = new URL(val);
      const path = urlObj.pathname;
      if (path.startsWith("/storage")) {
        const base = apiUrl.replace(/\/api$/, "");
        return `${base}${path}`;
      }
    } catch {
      // Fallback
    }
  }

  return val;
}
