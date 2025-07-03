import { Context } from "hono";
import { db } from "../../db";
import { eq, and } from "drizzle-orm";
import { userFavoriteGames } from "../../db/schemas/user-favorite-games.drizzle";
import { userProfiles } from "../../db/schemas/user-profile.drizzle";
import { gamesTable } from "../../db/schemas/games.drizzle";
import { z } from "zod";
import { ApiError } from "../../middleware/errorHandler";

// Validation schemas
const userIdSchema = z.string().regex(/^\d+$/, "Invalid user ID format");
const gameIdSchema = z.string().regex(/^\d+$/, "Invalid game ID format");
const addFavoriteGameSchema = z.object({
  gameId: gameIdSchema,
});

function convertBigIntToString(obj: any): any {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  if (obj !== null && typeof obj === "object") {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntToString(value);
    }
    return converted;
  }
  return obj;
}

export const addFavoriteGame = async (c: Context) => {
  const userIdParam = c.req.param("userId");
  const userIdResult = userIdSchema.safeParse(userIdParam);
  
  if (!userIdResult.success) {
    throw new ApiError("Invalid user ID", 400);
  }
  
  const data = await c.req.json();
  const result = addFavoriteGameSchema.safeParse(data);
  
  if (!result.success) {
    throw new ApiError(JSON.stringify(result.error.flatten().fieldErrors), 400);
  }
  
  const userId = BigInt(userIdResult.data);
  const gameId = BigInt(result.data.gameId);
  
  try {
    const favorite = await db.transaction(async (tx) => {
      // Check if user exists
      const [userExists] = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId));
      
      if (!userExists) {
        throw new ApiError("User not found", 404);
      }
      
      // Check if game exists
      const [gameExists] = await tx
        .select()
        .from(gamesTable)
        .where(eq(gamesTable.id, gameId));
      
      if (!gameExists) {
        throw new ApiError("Game not found", 404);
      }
      
      // Check if favorite already exists
      const [existingFavorite] = await tx
        .select()
        .from(userFavoriteGames)
        .where(
          and(
            eq(userFavoriteGames.userProfileId, userId),
            eq(userFavoriteGames.gameId, gameId)
          )
        );
      
      if (existingFavorite) {
        throw new ApiError("Game is already in favorites", 409);
      }
      
      // Insert new favorite
      const [newFavorite] = await tx
        .insert(userFavoriteGames)
        .values({
          userProfileId: userId,
          gameId: gameId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      return newFavorite;
    });
    
    const safeFavorite = convertBigIntToString(favorite);
    return c.json(safeFavorite, 201);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Internal server error", 500);
  }
};

export const removeFavoriteGame = async (c: Context) => {
  const userIdParam = c.req.param("userId");
  const gameIdParam = c.req.param("gameId");
  
  const userIdResult = userIdSchema.safeParse(userIdParam);
  const gameIdResult = gameIdSchema.safeParse(gameIdParam);
  
  if (!userIdResult.success) {
    throw new ApiError("Invalid user ID", 400);
  }
  
  if (!gameIdResult.success) {
    throw new ApiError("Invalid game ID", 400);
  }
  
  const userId = BigInt(userIdResult.data);
  const gameId = BigInt(gameIdResult.data);
  
  try {
    const [deletedFavorite] = await db
      .delete(userFavoriteGames)
      .where(
        and(
          eq(userFavoriteGames.userProfileId, userId),
          eq(userFavoriteGames.gameId, gameId)
        )
      )
      .returning();
    
    if (!deletedFavorite) {
      throw new ApiError("Favorite not found", 404);
    }
    
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Internal server error", 500);
  }
};

export const getFavoriteGames = async (c: Context) => {
  const userIdParam = c.req.param("userId");
  const userIdResult = userIdSchema.safeParse(userIdParam);
  
  if (!userIdResult.success) {
    throw new ApiError("Invalid user ID", 400);
  }
  
  const userId = BigInt(userIdResult.data);
  
  try {
    // Check if user exists
    const [userExists] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, userId));
    
    if (!userExists) {
      throw new ApiError("User not found", 404);
    }
    
    // Get favorite games with game details
    const favoriteGames = await db
      .select({
        id: userFavoriteGames.id,
        gameId: userFavoriteGames.gameId,
        gameName: gamesTable.name,
        createdAt: userFavoriteGames.createdAt,
      })
      .from(userFavoriteGames)
      .innerJoin(gamesTable, eq(userFavoriteGames.gameId, gamesTable.id))
      .where(eq(userFavoriteGames.userProfileId, userId));
    
    const safeFavoriteGames = convertBigIntToString(favoriteGames);
    return c.json(safeFavoriteGames);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Internal server error", 500);
  }
};