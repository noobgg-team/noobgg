"use client";

import React, { useState } from 'react'; // Added useState
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger, // No longer needed directly in DeleteConfirmationDialog if it's always controlled
} from "../../../ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void; // To control the dialog state from parent
  onConfirm: () => void | Promise<void>; // Can be sync or async
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean; // To show loading state on confirm button
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete the item.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isPending = false,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isPending}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (isPending) return;
              try {
                await onConfirm();
              } catch (error) {
                // Error should be handled by the caller (e.g., displayed in a toast)
                // This component's responsibility is to execute and manage dialog state.
                console.error("Delete confirmation dialog onConfirm error:", error);
              } finally {
                // Ensure dialog closes even if onConfirm throws and isn't caught by caller,
                // or if it's synchronous.
                onOpenChange(false);
              }
            }}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Props for the component that includes a trigger
interface DeleteConfirmationDialogWithTriggerProps {
  triggerComponent: React.ReactNode; // The component that will trigger the dialog
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
}

export const DeleteConfirmationDialogWithTrigger: React.FC<DeleteConfirmationDialogWithTriggerProps> = ({
  triggerComponent,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  isPending,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} style={{ display: 'inline-block', cursor: 'pointer' }}>
        {triggerComponent}
      </div>
      <DeleteConfirmationDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={onConfirm}
        title={title}
        description={description}
        confirmText={confirmText}
        cancelText={cancelText}
        isPending={isPending}
      />
    </>
  );
};
