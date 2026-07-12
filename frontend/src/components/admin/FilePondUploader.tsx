"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { Download, CheckCircle2, HardDrive, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMediaDownloadUrl, getMediaMetadata, type MediaMetadata } from "@/lib/api";
import { toast } from "sonner";

registerPlugin(FilePondPluginImagePreview);

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface FilePondUploaderProps {
  uploadKey: string;
  label: string;
  onSuccess: (url: string) => void;
  onProcessFile?: () => void;
  onProcessFileEnd?: () => void;
  acceptedFileTypes?: string[];
  currentValue?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function FilePondUploader({
  uploadKey,
  label,
  onSuccess,
  onProcessFile,
  onProcessFileEnd,
  acceptedFileTypes = ["image/*"],
  currentValue,
}: FilePondUploaderProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [files, setFiles] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState(false);
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const getResolvedUrl = (val: string) => {
    if (!val) return "";

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
  };

  const resolvedValue = currentValue ? getResolvedUrl(currentValue) : "";
  const isVideo = resolvedValue.match(/\.(mp4|webm|ogg)$/i);

  // Extract storage path from currentValue for metadata/download
  const storagePath = currentValue?.startsWith("/storage/cms/")
    ? currentValue.replace("/storage/cms/", "cms/")
    : currentValue?.includes("/cms/")
    ? "cms/" + currentValue.split("/cms/")[1]
    : null;

  useEffect(() => {
    if (storagePath) {
      getMediaMetadata(storagePath)
        .then(setMetadata)
        .catch(() => setMetadata(null));
    }
  }, [storagePath]);

  return (
    <div className="filepond-wrapper space-y-4">
      {/* Label and status */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{label}</p>
        {currentValue && (
          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Configured
          </span>
        )}
      </div>

      {/* Existing file preview */}
      {currentValue && (
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 flex flex-col items-center justify-center gap-3 transition-all hover:border-white/20">
          <div className="w-full h-32 rounded-xl overflow-hidden flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-muted/40 dark:bg-muted/10 relative">
            {isVideo ? (
              <video src={resolvedValue} controls className="h-full w-full object-contain" />
            ) : (
              <Image
                src={resolvedValue}
                alt={label}
                fill
                unoptimized
                className={`object-contain p-2 drop-shadow-md ${previewError ? "hidden" : ""}`}
                onError={() => setPreviewError(true)}
              />
            )}
          </div>

          {/* File info */}
          <div className="w-full flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-medium text-muted-foreground/60 break-all max-w-full truncate px-2">
                {currentValue.split("/").pop()}
              </p>
              {metadata && (
                <div className="flex items-center gap-3 mt-1 px-2">
                  <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                    <HardDrive size={10} /> {formatFileSize(metadata.size)}
                  </span>
                  {metadata.width && metadata.height && (
                    <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                      <Maximize size={10} /> {metadata.width}x{metadata.height}
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary shrink-0"
              title="Download file"
              onClick={() => {
                if (storagePath) {
                  window.open(getMediaDownloadUrl(storagePath), "_blank");
                }
              }}
            >
              <Download size={14} />
            </Button>
          </div>

          {/* Upload success indicator */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 bg-emerald-500/90 text-white px-2 py-1 rounded-full text-[9px] font-bold">
              <CheckCircle2 size={10} /> Active
            </div>
          </div>
        </div>
      )}

      {/* FilePond uploader */}
      <FilePond
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={false}
        maxFiles={1}
        acceptedFileTypes={acceptedFileTypes}
        beforeAddFile={(file) => {
          if (file.fileSize > MAX_FILE_SIZE_BYTES) {
            toast.error("File too large", {
              description: `Maximum file size is ${Math.round(MAX_FILE_SIZE_BYTES / 1024 / 1024)}MB. Your file is ${Math.round(file.fileSize / 1024 / 1024)}MB.`,
            });
            return false;
          }
          return true;
        }}
        server={{
          process: {
            url: `${apiUrl}/cms/upload`,
            method: "POST",
            withCredentials: true,
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            onload: (response: string) => {
              const data = JSON.parse(response);
              if (data.url) {
                onSuccess(data.url);
                if (data.size && data.width && data.height) {
                  setMetadata({
                    url: data.url,
                    path: data.path,
                    mime: data.mime,
                    size: data.size,
                    width: data.width,
                    height: data.height,
                  });
                }
              }
              if (onProcessFileEnd) onProcessFileEnd();
              return data.path;
            },
            onerror: (response: unknown) => {
              if (onProcessFileEnd) onProcessFileEnd();
              return (response as { data?: string })?.data;
            },
            ondata: (formData) => {
              formData.append("key", uploadKey);
              if (onProcessFile) onProcessFile();
              return formData;
            },
          },
        }}
        name="file"
        labelIdle={`Drag & Drop your ${label} or <span class="filepond--label-action">Browse</span>`}
        imagePreviewHeight={170}
        stylePanelLayout="compact"
        styleLoadIndicatorPosition="center bottom"
        styleProgressIndicatorPosition="right bottom"
        styleButtonRemoveItemPosition="left bottom"
        styleButtonProcessItemPosition="right bottom"
      />
    </div>
  );
}
