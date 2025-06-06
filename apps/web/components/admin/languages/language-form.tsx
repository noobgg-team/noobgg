"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner'; // Added toast import
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// Assuming Language type is available or will be provided by the hook later
// For now, let's redefine it for clarity, but this should be shared.
interface Language {
  id: number;
  name: string;
  code: string;
  flagUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Schema for form validation
const languageFormSchema = z.object({
  name: z.string().min(1, { message: "Language name is required." }),
  code: z
    .string()
    .min(2, { message: "Language code must be at least 2 characters." })
    .max(10, { message: "Language code cannot exceed 10 characters." })
    // Optionally, add regex for specific code formats, e.g., /^[a-z]{2}(-[A-Z]{2})?$/
    .regex(/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,4})?$/, { message: "Invalid language code format (e.g., en, en-US)."}),
  flagUrl: z.string().url({ message: "Invalid URL format." }).optional().or(z.literal('')), // Allow empty string, transform to null on submit
});

export type LanguageFormData = z.infer<typeof languageFormSchema>;

interface LanguageFormProps {
  initialData?: Language;
  onSubmit: (data: LanguageFormData) => Promise<void>;
  isPending?: boolean;
  onCancel?: () => void; // Optional: To close a modal or navigate back
}

export function LanguageForm({ initialData, onSubmit, isPending, onCancel }: LanguageFormProps) {
  const form = useForm<LanguageFormData>({
    resolver: zodResolver(languageFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      code: initialData?.code ?? '',
      flagUrl: initialData?.flagUrl ?? '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        code: initialData.code,
        flagUrl: initialData.flagUrl ?? '',
      });
    } else {
      // Clear form when initialData is not provided (e.g., for creating a new entry)
      form.reset({
        name: "",
        code: "",
        flagUrl: "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: LanguageFormData) => {
    const dataToSubmit = {
      ...values,
      flagUrl: values.flagUrl === '' ? null : values.flagUrl, // Convert empty string to null
    };
    try {
      await onSubmit(dataToSubmit);
      // form.reset(); // Resetting form might be handled by parent component after successful submission
    } catch (error: any) {
      console.error("Failed to save language:", error);
      toast.error(`Failed to save language: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., English" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., en or en-US" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="flagUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flag URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/flag.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Language' : 'Create Language')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
