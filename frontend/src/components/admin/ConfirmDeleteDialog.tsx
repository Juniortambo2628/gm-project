"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm deletion",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
}: ConfirmDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-6 py-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-destructive/10 text-destructive rounded-2xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose} className="rounded-xl px-6 h-11 font-bold">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="rounded-xl px-6 h-11 font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <><Loader2 className="animate-spin mr-2" size={16} /> Deleting...</>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
