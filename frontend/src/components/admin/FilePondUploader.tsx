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
}

export default function FilePondUploader({ 
  uploadKey, 
  label, 
  onSuccess,
  onProcessFile,
  onProcessFileEnd,
  acceptedFileTypes = ['image/*']
}: FilePondUploaderProps) {
  const [files, setFiles] = useState<any[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  return (
    <div className="filepond-wrapper space-y-4">
      <p className="text-[10px] font-bold text-muted-foreground ml-1">{label}</p>
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
