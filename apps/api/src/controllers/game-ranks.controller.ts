import { Request, Response } from 'express';
import {
  createGameRankSchema,
  gameRankIdSchema,
  updateGameRankSchema,
} from '../schemas/gamerank.schema';
import { db } from '../db';
import { gameRanks } from '../db/schemas/game-ranks.drizzle';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const createGameRank = async (req: Request, res: Response) => {
  try {
    const validatedData = createGameRankSchema.parse(req.body);

    const newGameRank = await db
      .insert(gameRanks)
      .values(validatedData)
      .returning();

    if (!newGameRank || newGameRank.length === 0) {
      return res.status(500).json({ message: 'Failed to create game rank' });
    }

    return res.status(201).json(newGameRank[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error creating game rank:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteGameRank = async (req: Request, res: Response) => {
  try {
    const { id } = gameRankIdSchema.parse({ id: req.params.id });

    const result = await db
      .update(gameRanks)
      .set({ deletedAt: new Date() })
      .where(eq(gameRanks.id, id))
      .returning({ id: gameRanks.id }); // Check if any row was affected

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'Game rank not found' });
    }

    return res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error deleting game rank:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateGameRank = async (req: Request, res: Response) => {
  try {
    const { id } = gameRankIdSchema.parse({ id: req.params.id });
    const validatedData = updateGameRankSchema.parse(req.body);

    // Ensure there's something to update
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const updatedGameRank = await db
      .update(gameRanks)
      .set(validatedData)
      .where(eq(gameRanks.id, id))
      .returning();

    if (!updatedGameRank || updatedGameRank.length === 0) {
      return res.status(404).json({ message: 'Game rank not found or no changes made' });
    }

    return res.status(200).json(updatedGameRank[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error updating game rank:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllGameRanks = async (req: Request, res: Response) => {
  try {
    const allGameRanks = await db.select().from(gameRanks);
    return res.status(200).json(allGameRanks);
  } catch (error) {
    console.error('Error fetching all game ranks:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getGameRankById = async (req: Request, res: Response) => {
  try {
    const { id } = gameRankIdSchema.parse({ id: req.params.id });

    const gameRank = await db
      .select()
      .from(gameRanks)
      .where(eq(gameRanks.id, id));

    if (!gameRank || gameRank.length === 0) {
      return res.status(404).json({ message: 'Game rank not found' });
    }

    return res.status(200).json(gameRank[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error fetching game rank by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
