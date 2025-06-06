"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // Optional: If the dialog is triggered by a child button
} from "@/components/ui/alert-dialog"; // Assuming ShadCN UI components
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void; // To control the dialog state from parent
  onConfirm: () => void;
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
          <AlertDialogAction onClick={onConfirm} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
            {isPending ? "Deleting..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Example of how it might be used with a trigger (optional, can be controlled externally too)
interface DeleteConfirmationDialogWithTriggerProps extends Omit<DeleteConfirmationDialogProps, 'isOpen' | 'onOpenChange'> {
  triggerButton: React.ReactNode; // The button that opens the dialog
}

export const DeleteConfirmationDialogWithTrigger: React.FC<DeleteConfirmationDialogWithTriggerProps> = ({
 triggerButton,
 ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {triggerButton}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title || "Are you absolutely sure?"}</AlertDialogTitle>
          <AlertDialogDescription>{props.description || "This action cannot be undone. This will permanently delete the item."}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)} disabled={props.isPending}>
            {props.cancelText || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={props.onConfirm} disabled={props.isPending} className="bg-destructive hover:bg-destructive/90">
            {props.isPending ? "Deleting..." : (props.confirmText || "Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
