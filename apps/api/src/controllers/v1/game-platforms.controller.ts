// v1: game-platforms controller

import { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { gamePlatforms } from "../../db/schemas/game-platforms.drizzle";
import { convertBigIntToNumber } from "../../utils/bigint-serializer";

export const getAllGamePlatformsController = async (c: Context) => {
  try {
    const result = await db.select().from(gamePlatforms);
    return c.json(convertBigIntToNumber(result));
  } catch {
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getGamePlatformByIdController = async (c: Context) => {
  try {
    const idParam = c.req.param("id");
    if (!idParam || !/^\d+$/.test(idParam)) {
      return c.json({ error: "Invalid id" }, 400);
    }
    const id = BigInt(Number(idParam));
    const result = await db.select().from(gamePlatforms).where(eq(gamePlatforms.id, id));
    if (result.length === 0)
      return c.json({ error: "GamePlatform not found" }, 404);
    return c.json(convertBigIntToNumber(result[0]));
  } catch {
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const createGamePlatformController = async (c: Context) => {
  try {
    const data = await c.req.json();
    if (!data.gameId || !/^\d+$/.test(data.gameId) || !data.platformId || !/^\d+$/.test(data.platformId)) {
      return c.json({ error: "gameId and platformId are required and must be numbers" }, 400);
    }
    const [created] = await db.insert(gamePlatforms).values({
      gameId: BigInt(Number(data.gameId)),
      platformId: BigInt(Number(data.platformId)),
    }).returning();
    return c.json(convertBigIntToNumber(created), 201);
  } catch (error: any) {
    if (error?.code === '23505') {
      return c.json({ error: "Duplicate game-platform combination" }, 409);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const updateGamePlatformController = async (c: Context) => {
  try {
    const idParam = c.req.param("id");
    if (!idParam || !/^\d+$/.test(idParam)) {
      return c.json({ error: "Invalid id" }, 400);
    }
    const id = BigInt(Number(idParam));
    const data = await c.req.json();
    const updateData: any = {};
    if (data.gameId && /^\d+$/.test(data.gameId)) updateData.gameId = BigInt(Number(data.gameId));
    if (data.platformId && /^\d+$/.test(data.platformId)) updateData.platformId = BigInt(Number(data.platformId));
    if (Object.keys(updateData).length === 0) {
      return c.json({ error: "No valid data provided" }, 400);
    }
    const [updated] = await db.update(gamePlatforms).set(updateData).where(eq(gamePlatforms.id, id)).returning();
    if (!updated) return c.json({ error: "GamePlatform not found" }, 404);
    return c.json(convertBigIntToNumber(updated));
  } catch (error: any) {
    if (error?.code === '23505') {
      return c.json({ error: "Duplicate game-platform combination" }, 409);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const deleteGamePlatformController = async (c: Context) => {
  try {
    const idParam = c.req.param("id");
    if (!idParam || !/^\d+$/.test(idParam)) {
      return c.json({ error: "Invalid id" }, 400);
    }
    const id = BigInt(Number(idParam));
    const [deleted] = await db.delete(gamePlatforms).where(eq(gamePlatforms.id, id)).returning();
    if (!deleted) return c.json({ error: "GamePlatform not found" }, 404);
    return c.json(convertBigIntToNumber(deleted));
  } catch {
    return c.json({ error: "Internal server error" }, 500);
  }
};
