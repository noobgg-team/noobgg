import { Request, Response } from 'express';
import { db } from '../db';
import { languages } from '../db/schemas/languages.drizzle';
import { z } from 'zod';
import { asc, desc, eq, ilike, or, count } from 'drizzle-orm';

// Zod schema for creating a language
const createLanguageSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(10), // Assuming language codes are short
  flagUrl: z.string().url().optional().nullable(),
});

export const createLanguage = async (req: Request, res: Response) => {
  try {
    const validationResult = createLanguageSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.flatten() });
    }

    const { name, code, flagUrl } = validationResult.data;

    const [newLanguage] = await db
      .insert(languages)
      .values({ name, code, flagUrl })
      .returning();

    return res.status(201).json(newLanguage);
  } catch (error: any) {
    console.error('Error creating language:', error);
    // Check for unique constraint violation (specific to PostgreSQL)
    if (error.code === '23505' && error.constraint === 'languages_code_unique') {
      return res.status(409).json({ message: 'Language with this code already exists.' });
    }
    if (error.code === '23505' && error.constraint === 'languages_name_unique') {
      return res.status(409).json({ message: 'Language with this name already exists.' });
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

    const conditions = [];
    if (search) {
      conditions.push(or(ilike(languages.name, `%${search}%`), ilike(languages.code, `%${search}%`)));
    }

    const query = db.select().from(languages).where(or(...conditions)).limit(limit).offset(offset);

    if (sortBy) {
      const column = languages[sortBy];
      query.orderBy(sortOrder === 'asc' ? asc(column) : desc(column));
    } else {
      query.orderBy(desc(languages.createdAt)); // Default sort
    }

    const result = await query;

    const totalRecordsQuery = db.select({ count: count() }).from(languages).where(or(...conditions));
    const [{ count: totalRecords }] = await totalRecordsQuery;
    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      data: result,
      pagination: {
        page,
        limit,
        totalPages,
        totalRecords,
      },
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllLanguages = async (req: Request, res: Response) => {
  try {
    const allLangs = await db.select().from(languages).orderBy(asc(languages.name));
    return res.status(200).json(allLangs);
  } catch (error) {
    console.error('Error fetching all languages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLanguageById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid language ID' });
    }

    const [language] = await db.select().from(languages).where(eq(languages.id, id));

    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }

    return res.status(200).json(language);
  } catch (error) {
    console.error('Error fetching language by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateLanguage = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid language ID' });
    }

    const validationResult = updateLanguageSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.flatten() });
    }

    const { name, code, flagUrl } = validationResult.data;

    if (!name && !code && flagUrl === undefined) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const currentLanguage = await db.select({ code: languages.code, name: languages.name }).from(languages).where(eq(languages.id, id));
    if (!currentLanguage.length) {
        return res.status(404).json({ message: 'Language not found' });
    }


    const [updatedLanguage] = await db
      .update(languages)
      .set({ name, code, flagUrl, updatedAt: new Date() })
      .where(eq(languages.id, id))
      .returning();

    if (!updatedLanguage) {
      return res.status(404).json({ message: 'Language not found' });
    }

    return res.status(200).json(updatedLanguage);
  } catch (error: any) {
    console.error('Error updating language:', error);
     if (error.code === '23505' && error.constraint === 'languages_code_unique') {
      return res.status(409).json({ message: 'Language with this code already exists.' });
    }
    if (error.code === '23505' && error.constraint === 'languages_name_unique') {
      return res.status(409).json({ message: 'Language with this name already exists.' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteLanguage = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid language ID' });
    }

    const [deletedLanguage] = await db
      .delete(languages)
      .where(eq(languages.id, id))
      .returning();

    if (!deletedLanguage) {
      return res.status(404).json({ message: 'Language not found' });
    }

    return res.status(200).json({ message: 'Language deleted successfully' });
  } catch (error) {
    console.error('Error deleting language:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
