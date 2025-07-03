import { Context } from "hono";
import { db } from "../../db";
import { eq, and, isNull } from "drizzle-orm";
import { userProfiles } from "../../db/schemas/user-profile.drizzle";
import {
  createUserProfileDto,
  updateUserProfileDto,
} from "@repo/shared/dto/user-profile.dto";
import { ApiError } from "../../middleware/errorHandler";

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

function incrementRowVersion(currentVersion: string): string {
  return (BigInt(currentVersion) + 1n).toString();
}

export const getUserProfile = async (c: Context) => {
  const idParam = c.req.param("id");
  if (!idParam || !/^\d+$/.test(idParam)) {
    throw new ApiError("Invalid id", 400);
  }
  const id = BigInt(idParam);
  const includeDeleted = c.req.query("includeDeleted") === "true";
  
  const whereCondition = includeDeleted
    ? eq(userProfiles.id, id)
    : and(eq(userProfiles.id, id), isNull(userProfiles.deletedAt));
  
  const [user] = await db
    .select()
    .from(userProfiles)
    .where(whereCondition);
    
  if (!user) throw new ApiError("User not found", 404);
  const safeUser = convertBigIntToString(user);
  return c.json(safeUser);
};

export const getUserProfileByUsername = async (c: Context) => {
  const username = c.req.param("username");
  if (!username) {
    throw new ApiError("Username is required", 400);
  }
  
  const includeDeleted = c.req.query("includeDeleted") === "true";
  
  const whereCondition = includeDeleted
    ? eq(userProfiles.userName, username)
    : and(eq(userProfiles.userName, username), isNull(userProfiles.deletedAt));
  
  const [user] = await db
    .select()
    .from(userProfiles)
    .where(whereCondition);
    
  if (!user) throw new ApiError("User not found", 404);
  const safeUser = convertBigIntToString(user);
  return c.json(safeUser);
};

export const createUserProfile = async (c: Context) => {
  const data = await c.req.json();
  const result = createUserProfileDto.safeParse(data);
  if (!result.success) {
    throw new ApiError(JSON.stringify(result.error.flatten().fieldErrors), 400);
  }
  
  try {
    const user = await db.transaction(async (tx) => {
      // Check for duplicate userKeycloakId
      const [isKeycloakUserExists] = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userKeycloakId, result.data.userKeycloakId));
      if (isKeycloakUserExists)
        throw new ApiError("Keycloak ID already exists", 409);
        
      // Check for duplicate userName
      const [isUsernameTaken] = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userName, result.data.userName));
      if (isUsernameTaken) throw new ApiError("Username already exists", 409);
      
      // Insert new user with all fields
      const [newUser] = await tx
        .insert(userProfiles)
        .values({
          ...result.data,
          birthDate: result.data.birthDate
            ? new Date(result.data.birthDate)
            : undefined,
          createdAt: new Date(),
          lastOnline: new Date(),
          rowVersion: "0",
        })
        .returning();
      return newUser;
    });
    
    const safeUser = convertBigIntToString(user);
    return c.json(
      {
        success: true,
        message: "User profile created successfully",
        data: safeUser,
      },
      201
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Internal server error", 500);
  }
};

export const updateUserProfile = async (c: Context) => {
  const idParam = c.req.param("id");
  if (!idParam || !/^\d+$/.test(idParam)) {
    throw new ApiError("Invalid id", 400);
  }
  const id = BigInt(idParam);
  const data = await c.req.json();
  const result = updateUserProfileDto.safeParse(data);
  
  if (!result.success) {
    throw new ApiError(JSON.stringify(result.error.flatten().fieldErrors), 400);
  }
  
  // Check if payload has at least one field to update (excluding rowVersion)
  const fieldsToUpdate = Object.keys(result.data).filter(key => key !== 'rowVersion');
  if (fieldsToUpdate.length === 0) {
    throw new ApiError("No data provided", 400);
  }
  
  try {
    const updatedUser = await db.transaction(async (tx) => {
      // Check current user and rowVersion
      const [currentUser] = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, id));
        
      if (!currentUser) {
        throw new ApiError("User not found", 404);
      }
      
      // Check optimistic concurrency
      if (currentUser.rowVersion !== result.data.rowVersion) {
        throw new ApiError("Resource has been modified by another user", 409);
      }
      
      // Check for duplicate userKeycloakId if provided
      if (result.data.userKeycloakId) {
        const [existing] = await tx
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userKeycloakId, result.data.userKeycloakId));
        if (existing && existing.id !== id) {
          throw new ApiError("Keycloak ID already exists", 409);
        }
      }
      
      // Check for duplicate userName if provided
      if (result.data.userName) {
        const [existing] = await tx
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userName, result.data.userName));
        if (existing && existing.id !== id) {
          throw new ApiError("Username already exists", 409);
        }
      }
      
      // Update user with incremented rowVersion
      const updateData = {
        ...result.data,
        birthDate: result.data.birthDate
          ? new Date(result.data.birthDate)
          : undefined,
        updatedAt: new Date(),
        rowVersion: incrementRowVersion(currentUser.rowVersion),
      };
      
      // Remove rowVersion from data object as it's already set
      delete (updateData as any).rowVersion;
      
      const [updated] = await tx
        .update(userProfiles)
        .set({
          ...updateData,
          rowVersion: incrementRowVersion(currentUser.rowVersion),
        })
        .where(eq(userProfiles.id, id))
        .returning();
        
      return updated;
    });
    
    const safeUser = convertBigIntToString(updatedUser);
    return c.json(
      {
        success: true,
        message: "User profile updated successfully",
        data: safeUser,
      },
      200 // Changed from 201 to 200 for updates
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Internal server error", 500);
  }
};

export const deleteUserProfile = async (c: Context) => {
  const idParam = c.req.param("id");
  if (!idParam || !/^\d+$/.test(idParam)) {
    throw new ApiError("Invalid id", 400);
  }
  const id = BigInt(idParam);
  
  try {
    const deletedUser = await db.transaction(async (tx) => {
      // Get current user to check rowVersion
      const [currentUser] = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, id));
        
      if (!currentUser) {
        throw new ApiError("User not found", 404);
      }
      
      if (currentUser.deletedAt) {
        throw new ApiError("User already deleted", 409);
      }
      
      // Soft delete with incremented rowVersion
      const [deleted] = await tx
        .update(userProfiles)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
          rowVersion: incrementRowVersion(currentUser.rowVersion),
        })
        .where(eq(userProfiles.id, id))
        .returning();
        
      return deleted;
    });
    
    const safeUser = convertBigIntToString(deletedUser);
    return c.json(
      {
        success: true,
        message: "User profile deleted successfully",
        data: safeUser,
      },
      200 // Changed from 201 to 200 for deletes
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Internal server error", 500);
  }
};