import { z } from 'zod';

export const createGameRankSchema = z.object({
  name: z.string().min(1),
  image: z.string().url(),
  order: z.number().int().positive(),
  gameId: z.number().int().positive(),
});

export const updateGameRankSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional(),
  order: z.number().int().positive().optional(),
  gameId: z.number().int().positive().optional(),
});

export const gameRankIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});
