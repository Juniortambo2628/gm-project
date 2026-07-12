"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, Heading, List, ListOrdered, Link as LinkIcon, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichHtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichHtmlEditor({ value, onChange, placeholder, className }: RichHtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const isEmpty = !value || value === "" || value === "<br>";

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleAction = (command: string, valueArg = "") => {
    if (command === "createLink") {
      const url = typeof window !== "undefined" ? window.prompt("Enter link URL") : null;
      if (!url) return;
      document.execCommand(command, false, url);
    } else {
      document.execCommand(command, false, valueArg);
    }

    const editor = editorRef.current;
    if (editor) {
      onChange(editor.innerHTML);
      editor.focus();
    }
  };

  const toolbar = [
    { icon: Bold, label: "Bold", command: "bold" },
    { icon: Italic, label: "Italic", command: "italic" },
    { icon: Underline, label: "Underline", command: "underline" },
    { icon: Heading, label: "Heading", command: "formatBlock", value: "<h2>" },
    { icon: List, label: "Bullet list", command: "insertUnorderedList" },
    { icon: ListOrdered, label: "Numbered list", command: "insertOrderedList" },
    { icon: LinkIcon, label: "Link", command: "createLink" },
    { icon: Undo2, label: "Undo", command: "undo" },
    { icon: Redo2, label: "Redo", command: "redo" },
  ];

  return (
    <div className={cn("border rounded-2xl overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        {toolbar.map((item) => (
          <Button
            key={item.label}
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleAction(item.command, item.value)}
            title={item.label}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <item.icon size={15} />
          </Button>
        ))}
      </div>

      <div className="relative min-h-[220px]">
        <div
          ref={editorRef}
          contentEditable
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="min-h-[220px] w-full p-5 text-sm leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60"
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
        {isEmpty && !focused && placeholder && (
          <div className="pointer-events-none absolute top-5 left-5 text-sm text-muted-foreground/60">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
