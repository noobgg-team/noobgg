"use client";

import { apiClient } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"; // Added keepPreviousData
import { toast } from "sonner"; // Assuming 'sonner' is used for toasts

// Types should align with your API responses and shared types
export interface Language {
  id: number;
  name: string;
  code: string;
  flagUrl?: string | null;
  createdAt: string; // Assuming ISO string format
  updatedAt: string; // Assuming ISO string format
}

export interface LanguageFormData {
  name: string;
  code: string;
  flagUrl?: string | null;
}

export interface PaginatedLanguagesResponse {
  data: Language[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
}

interface UseLanguagesOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof Language | string; // Allow string for custom sort keys from API
  sortOrder?: "asc" | "desc";
}

const LANGUAGE_QUERY_KEY = "languages";

export const useLanguages = (options: UseLanguagesOptions = {}) => {
  const { page = 1, limit = 10, search, sortBy, sortOrder } = options;

  const queryKey = [LANGUAGE_QUERY_KEY, { page, limit, search, sortBy, sortOrder }];

  const {
    data: queryData,
    isLoading,
    error,
    refetch, // tanstack-query provides refetch
    isPlaceholderData, // Added isPlaceholderData
  } = useQuery<PaginatedLanguagesResponse, Error>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search) params.append("search", search);
      if (sortBy) params.append("sortBy", String(sortBy));
      if (sortOrder) params.append("sortOrder", sortOrder);

      const response = await apiClient.get(`/languages?${params.toString()}`);
      return response.data;
    },
    placeholderData: keepPreviousData, // Replaced keepPreviousData: true
  });

  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: [LANGUAGE_QUERY_KEY] });
  };

  const createLanguageMutation = useMutation<Language, Error, LanguageFormData>({
    mutationFn: async (languageData) => {
      const response = await apiClient.post("/languages", languageData);
      return response.data;
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success("Language created successfully!");
    },
    onError: (err) => {
      toast.error(`Error creating language: ${err.message}`);
    },
  });

  const updateLanguageMutation = useMutation<
    Language,
    Error,
    { id: number; data: Partial<LanguageFormData> }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(`/languages/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success("Language updated successfully!");
    },
    onError: (err) => {
      toast.error(`Error updating language: ${err.message}`);
    },
  });

  const deleteLanguageMutation = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/languages/${id}`);
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success("Language deleted successfully!");
    },
    onError: (err) => {
      toast.error(`Error deleting language: ${err.message}`);
    },
  });

  return {
    languages: queryData?.data || [],
    pagination: queryData?.pagination || { page: 1, limit: 10, totalPages: 1, totalRecords: 0 },
    isLoading,
    error,
    isPlaceholderData, // Added to return object
    refetchLanguages: refetch, // Expose refetch
    createLanguage: createLanguageMutation.mutateAsync,
    updateLanguage: updateLanguageMutation.mutateAsync,
    deleteLanguage: deleteLanguageMutation.mutateAsync,
    isCreating: createLanguageMutation.isPending,
    isUpdating: updateLanguageMutation.isPending,
    isDeleting: deleteLanguageMutation.isPending,
  };
};

export const useAllLanguages = () => {
  const { data, isLoading, error } = useQuery<Language[], Error>({
    queryKey: [LANGUAGE_QUERY_KEY, "all"],
    queryFn: async () => {
      const response = await apiClient.get("/languages/all");
      return response.data;
    },
  });

  return {
    languages: data || [],
    isLoading,
    error,
  };
};
