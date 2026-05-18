"use client";

import React, { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

registerPlugin(FilePondPluginImagePreview);

interface FilePondUploaderProps {
  uploadKey: string;
  label: string;
  onSuccess: (url: string) => void;
  onProcessFile?: () => void;
  onProcessFileEnd?: () => void;
  acceptedFileTypes?: string[];
  currentValue?: string;
}

export default function FilePondUploader({ 
  uploadKey, 
  label, 
  onSuccess,
  onProcessFile,
  onProcessFileEnd,
  acceptedFileTypes = ['image/*'],
  currentValue
}: FilePondUploaderProps) {
  const [files, setFiles] = useState<any[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return (
    <div className="filepond-wrapper space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{label}</p>
        {currentValue && (
          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Configured
          </span>
        )}
      </div>

      {currentValue && (
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 flex flex-col items-center justify-center gap-3 transition-all hover:border-white/20">
          <div className="w-full h-32 rounded-xl overflow-hidden flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-muted/40 dark:bg-muted/10 relative">
            {currentValue.endsWith('.mp4') || currentValue.endsWith('.webm') || currentValue.endsWith('.ogg') ? (
              <video 
                src={currentValue} 
                controls 
                className="h-full w-full object-contain"
              />
            ) : (
              <img 
                src={currentValue} 
                alt={label} 
                className="max-h-full max-w-full object-contain p-2 drop-shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
          <p className="text-[9px] font-medium text-muted-foreground/60 break-all max-w-full truncate px-2">{currentValue.split('/').pop()}</p>
        </div>
      )}
      <FilePond
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={false}
        maxFiles={1}
        acceptedFileTypes={acceptedFileTypes}
        server={{
          process: {
            url: `${apiUrl}/cms/upload`,
            method: 'POST',
            withCredentials: true,
            headers: {
              'Accept': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            onload: (response: string) => {
              const data = JSON.parse(response);
              if (data.url) {
                onSuccess(data.url);
              }
              if (onProcessFileEnd) onProcessFileEnd();
              return data.path;
            },
            onerror: (response: any) => {
               if (onProcessFileEnd) onProcessFileEnd();
               return response.data;
            },
            ondata: (formData) => {
               formData.append('key', uploadKey);
               if (onProcessFile) onProcessFile();
               return formData;
            }
          }
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
