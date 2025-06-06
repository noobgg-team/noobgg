import { Request, Response } from 'express';
import { db } from '../db';
import { languages as languagesTableSchema } from '../db/schemas/languages.drizzle';
import { z } from 'zod';
import { asc, desc, eq, ilike, or, count, isNull, and } from 'drizzle-orm'; // Added isNull and and

// Helper function to convert BigInt ID to string for a single language object
const stringifyLanguageId = (language: typeof languagesTableSchema.$inferSelect) => {
  if (language && typeof language.id === 'bigint') {
    return { ...language, id: language.id.toString() };
  }
  return language;
};

// Helper function to convert BigInt IDs to strings for an array of language objects
const stringifyLanguageIds = (languagesArray: Array<typeof languagesTableSchema.$inferSelect>) => {
  return languagesArray.map(stringifyLanguageId);
};

// Zod schema for creating a language
const createLanguageSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(10),
  flagUrl: z.string().url().optional().nullable(),
});

export const createLanguage = async (req: Request, res: Response) => {
  try {
    const validationResult = createLanguageSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.flatten() });
    }

    const { name, code, flagUrl } = validationResult.data;

    // Check if a language with the same code was soft-deleted
    const [existingSoftDeleted] = await db
      .select({ id: languagesTableSchema.id, deletedAt: languagesTableSchema.deletedAt })
      .from(languagesTableSchema)
      .where(and(eq(languagesTableSchema.code, code), isNull(languagesTableSchema.deletedAt))); // Ensure we are checking non-deleted ones for conflict, or reactivate

    if (existingSoftDeleted && !existingSoftDeleted.deletedAt) {
         return res.status(409).json({ message: 'Language with this code already exists.' });
    }

    // If it was soft-deleted, we could potentially revive and update it here instead of inserting
    // For now, this example focuses on preventing duplicates with active records.
    // A more complex scenario might involve undeleting.

    const [newLanguageFromDb] = await db
      .insert(languagesTableSchema)
      .values({ name, code, flagUrl, deletedAt: null }) // Ensure deletedAt is null on creation
      .returning();

    if (!newLanguageFromDb) {
        return res.status(500).json({ message: 'Failed to create language' });
    }

    return res.status(201).json(stringifyLanguageId(newLanguageFromDb));
  } catch (error: any) {
    console.error('Error creating language:', error);
    // Check for PostgreSQL unique violation error code
    if (error.code === '23505') {
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('languages_code_idx')) {
          return res.status(409).json({ message: 'Language with this code already exists.' });
        }
        if (error.message.includes('languages_name_idx')) {
          return res.status(409).json({ message: 'Language with this name already exists.' });
        }
      }
      // Fallback for generic unique violation if specific index not identified in message
      return res.status(409).json({ message: 'A language with this name or code already exists (unique constraint violation).' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Zod schema for updating a language
const updateLanguageSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).max(10).optional(),
  flagUrl: z.string().url().optional().nullable(),
});

// Zod schema for query parameters in getLanguages
const getLanguagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'code', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const getLanguages = async (req: Request, res: Response) => {
  try {
    const validationResult = getLanguagesQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.flatten() });
    }

    const { page, limit, search, sortBy, sortOrder } = validationResult.data;
    const offset = (page - 1) * limit;

    // Always filter out soft-deleted records
    const baseQueryConditions = [isNull(languagesTableSchema.deletedAt)];

    if (search) {
      baseQueryConditions.push(or(ilike(languagesTableSchema.name, `%${search}%`), ilike(languagesTableSchema.code, `%${search}%`)));
    }

    const combinedConditions = and(...baseQueryConditions);

    let query = db.select().from(languagesTableSchema).where(combinedConditions).limit(limit).offset(offset);
    let totalRecordsQuery = db.select({ count: count() }).from(languagesTableSchema).where(combinedConditions);

    const sortableColumns = ['name', 'code', 'createdAt', 'updatedAt'] as const;
    type SortableColumn = typeof sortableColumns[number];

    if (sortBy && sortableColumns.includes(sortBy as SortableColumn)) {
        const column = languagesTableSchema[sortBy as SortableColumn];
        query = query.orderBy(sortOrder === 'asc' ? asc(column) : desc(column));
    } else {
        query = query.orderBy(desc(languagesTableSchema.createdAt));
    }

    const result = await query;
    const [{ count: totalRecordsValue }] = await totalRecordsQuery;
    const totalPages = Math.ceil(Number(totalRecordsValue) / limit);

    return res.status(200).json({
      data: stringifyLanguageIds(result),
      pagination: {
        page,
        limit,
        totalPages,
        totalRecords: Number(totalRecordsValue),
      },
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllLanguages = async (req: Request, res: Response) => {
  try {
    const allLangs = await db
      .select()
      .from(languagesTableSchema)
      .where(isNull(languagesTableSchema.deletedAt)) // Filter out soft-deleted
      .orderBy(asc(languagesTableSchema.name));
    return res.status(200).json(stringifyLanguageIds(allLangs));
  } catch (error) {
    console.error('Error fetching all languages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLanguageById = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    let id: bigint;
    try {
      id = BigInt(idParam);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid language ID format' });
    }

    const [languageFromDb] = await db
      .select()
      .from(languagesTableSchema)
      .where(and(eq(languagesTableSchema.id, id), isNull(languagesTableSchema.deletedAt))); // Filter out soft-deleted

    if (!languageFromDb) {
      return res.status(404).json({ message: 'Language not found' });
    }

    return res.status(200).json(stringifyLanguageId(languageFromDb));
  } catch (error) {
    console.error('Error fetching language by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateLanguage = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    let id: bigint;
    try {
      id = BigInt(idParam);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid language ID format' });
    }

    const validationResult = updateLanguageSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.flatten() });
    }

    const { name, code, flagUrl } = validationResult.data;

    if (!name && !code && flagUrl === undefined) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Check if language exists and is not soft-deleted before attempting update
    const [existingLanguage] = await db
        .select({ id: languagesTableSchema.id })
        .from(languagesTableSchema)
        .where(and(eq(languagesTableSchema.id, id), isNull(languagesTableSchema.deletedAt)));

    if (!existingLanguage) {
        return res.status(404).json({ message: 'Language not found or has been deleted' });
    }

    // If code is being updated, check for conflicts with other non-deleted languages
    // Note: A robust check for code conflicts during update would involve:
    // 1. Querying for languages where code matches the new code,
    //    deletedAt IS NULL, AND id IS NOT the current language's id.
    // 2. If such a record exists, return a 409 conflict.
    // This is often best handled by a unique database constraint that considers NULLs
    // (e.g., a partial unique index or a unique index on `(code, COALESCE(deleted_at, 'epoch'))`).
    // The generic unique constraint error (23505) will be caught below if the DB enforces it.


    const [updatedLanguageFromDb] = await db
      .update(languagesTableSchema)
      .set({ name, code, flagUrl, updatedAt: new Date() })
      .where(and(eq(languagesTableSchema.id, id), isNull(languagesTableSchema.deletedAt))) // Ensure we only update non-deleted
      .returning();

    // If where condition (id and not deleted) didn't match, updatedLanguageFromDb would be undefined
    if (!updatedLanguageFromDb) {
      return res.status(404).json({ message: 'Language not found or already deleted' });
    }

    return res.status(200).json(stringifyLanguageId(updatedLanguageFromDb));
  } catch (error: any) {
    console.error('Error updating language:', error);
     if (error.code === '23505') { // Generic unique violation
      return res.status(409).json({ message: 'A language with this name or code already exists.' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteLanguage = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    let id: bigint;
    try {
      id = BigInt(idParam);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid language ID format' });
    }

    // Check if the language exists and is not already soft-deleted
    const [languageToSoftDelete] = await db
      .select({ id: languagesTableSchema.id, deletedAt: languagesTableSchema.deletedAt })
      .from(languagesTableSchema)
      .where(eq(languagesTableSchema.id, id));

    if (!languageToSoftDelete) {
      return res.status(404).json({ message: 'Language not found' });
    }

    if (languageToSoftDelete.deletedAt) {
      return res.status(400).json({ message: 'Language already deleted' });
    }

    const [softDeletedLanguage] = await db
      .update(languagesTableSchema)
      .set({ deletedAt: new Date(), updatedAt: new Date() }) // Also update updatedAt
      .where(eq(languagesTableSchema.id, id))
      .returning({ id: languagesTableSchema.id }); // Return minimal data

    if (!softDeletedLanguage) {
      // Should be caught by the check above, but as a safeguard
      return res.status(404).json({ message: 'Language not found during soft delete attempt' });
    }

    return res.status(200).json({ message: 'Language deleted successfully (soft delete)' });
  } catch (error) {
    console.error('Error soft deleting language:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
