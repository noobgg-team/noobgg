"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LanguagesTable } from '@/components/admin/languages/languages-table';
import { LanguageForm, LanguageFormData } from '@/components/admin/languages/language-form';
import { DeleteConfirmationDialog } from '@/components/admin/common/delete-confirmation-dialog';
import { useLanguages, Language } from '@/hooks/use-languages';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function LanguagesPage() {
  // State for controlling table options
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt'); // Align with Language interface key
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    languages,
    pagination,
    isLoading,
    error,
    // refetchLanguages, // Available if manual refetch is needed
    createLanguage,
    updateLanguage,
    deleteLanguage,
    isCreating,
    isUpdating,
    isDeleting,
  } = useLanguages({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);

  const [isDeleteDialogValid, setIsDeleteDialogValid] = useState(false);
  const [deletingLanguage, setDeletingLanguage] = useState<Language | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenFormModal = (language: Language | null = null) => {
    setEditingLanguage(language);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingLanguage(null);
  };

  const handleFormSubmit = async (data: LanguageFormData) => {
    setFormError(null);
    try {
      if (editingLanguage) {
        await updateLanguage({ id: editingLanguage.id, data });
      } else {
        await createLanguage(data);
      }
      handleCloseFormModal();
      // Invalidation and refetching are handled by react-query in the hook
    } catch (e: any) {
      // Error toast is handled by the hook, but we can set local form error if needed
      setFormError(e.message || "An error occurred. Check console for details.");
      console.error("Form submission error:", e);
    }
  };

  const handleOpenDeleteDialog = (language: Language) => {
    setDeletingLanguage(language);
    setIsDeleteDialogValid(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogValid(false);
    setDeletingLanguage(null);
  };

  const handleDeleteConfirm = async () => {
    if (deletingLanguage) {
      try {
        await deleteLanguage(deletingLanguage.id);
        handleCloseDeleteDialog();
        // Invalidation and refetching are handled by react-query in the hook
      } catch (e: any) {
        // Error toast is handled by the hook.
        console.error("Delete error:", e);
        handleCloseDeleteDialog(); // Still close dialog
      }
    }
  };

  const tableProps = {
    data: languages,
    pagination, // This pagination comes directly from the hook's response
    isLoading: isLoading, // Overall loading state
    onPageChange: setPage, // Update local state, which triggers hook refetch
    onLimitChange: (newLimit: number) => { // Update local state
      setLimit(newLimit);
      setPage(1); // Reset to page 1 on limit change
    },
    onSearchChange: setSearch, // Update local state
    onSortChange: (newSortBy: string, newSortOrder: 'asc' | 'desc') => { // Update local state
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
    },
    onEdit: handleOpenFormModal,
    onDelete: handleOpenDeleteDialog,
  };

  // Determine if any mutation is in progress for a general loading indicator on form/dialogs
  const isMutating = isCreating || isUpdating || isDeleting;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Languages</h1>
        <Button onClick={() => handleOpenFormModal()} disabled={isMutating}>
          New Language
        </Button>
      </div>

      {error && ( // Display query error
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error fetching languages: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      )}

      <LanguagesTable {...tableProps} />

      <Dialog open={isFormModalOpen} onOpenChange={(isOpen) => !isMutating && setIsFormModalOpen(isOpen)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingLanguage ? 'Edit Language' : 'Create New Language'}</DialogTitle>
            {editingLanguage && <DialogDescription>Update the details for {editingLanguage.name}.</DialogDescription>}
          </DialogHeader>

          <LanguageForm
            initialData={editingLanguage ?? undefined}
            onSubmit={handleFormSubmit}
            isPending={isCreating || isUpdating}
            onCancel={() => !isMutating && handleCloseFormModal()}
          />
          {formError && ( // Display form-specific submission error
            <div className="text-red-500 text-sm mt-2 bg-red-100 p-2 rounded">
              {formError}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {deletingLanguage && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogValid}
          onOpenChange={(isOpen) => !isDeleting && setIsDeleteDialogValid(isOpen)}
          onConfirm={handleDeleteConfirm}
          title={`Delete Language: ${deletingLanguage.name}`}
          description={`Are you sure you want to delete "${deletingLanguage.name}"? This action cannot be undone.`}
          isPending={isDeleting}
        />
      )}
    </div>
  );
}
