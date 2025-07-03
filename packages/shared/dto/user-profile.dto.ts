import { z } from "zod";

// Enum definitions matching database schema
export const genderEnum = z.enum(["male", "female", "unknown"]);
export const regionEnum = z.enum([
  "north_america",
  "south_america",
  "europe",
  "asia",
  "oceania",
  "middle_east",
  "africa",
  "russia_cis",
  "unknown",
]);

export const gameGenreEnum = z.enum([
  "action",
  "adventure",
  "battle_royale",
  "fighting",
  "fps",
  "mmorpg",
  "moba",
  "platformer",
  "puzzle",
  "racing",
  "rpg",
  "rts",
  "simulation",
  "sports",
  "strategy",
  "survival",
  "unknown",
]);

export const playerTypeEnum = z.enum([
  "casual",
  "competitive",
  "professional",
  "content_creator",
  "coach",
  "unknown",
]);

export const industryRoleEnum = z.enum([
  "player",
  "developer",
  "publisher",
  "esports_org",
  "tournament_organizer",
  "content_creator",
  "journalist",
  "analyst",
  "coach",
  "manager",
  "unknown",
]);

export const lookingForEnum = z.enum([
  "teammates",
  "friends",
  "guild",
  "coach",
  "students",
  "scrims",
  "tournaments",
  "casual_play",
  "unknown",
]);

export const presenceStatusEnum = z.enum([
  "online",
  "offline",
  "away",
  "do_not_disturb",
  "invisible",
  "unknown",
]);

// Create DTO - includes all fields except system fields
export const createUserProfileDto = z.object({
  userKeycloakId: z.string().min(1).max(100),
  userName: z.string().min(1).max(50),
  firstName: z.string().max(60).optional(),
  lastName: z.string().max(60).optional(),
  profileImageUrl: z.string().max(255).optional(),
  bannerImageUrl: z.string().max(255).optional(),
  bio: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  gender: genderEnum.default("unknown"),
  region: regionEnum.default("unknown"),
  favoriteGameGenre: gameGenreEnum.default("unknown"),
  playerType: playerTypeEnum.default("unknown"),
  industryRole: industryRoleEnum.default("unknown"),
  lookingFor: lookingForEnum.default("unknown"),
  presenceStatus: presenceStatusEnum.default("unknown"),
});

// Update DTO - all fields optional except for rowVersion (for optimistic locking)
export const updateUserProfileDto = z.object({
  userKeycloakId: z.string().min(1).max(100).optional(),
  userName: z.string().min(1).max(50).optional(),
  firstName: z.string().max(60).optional(),
  lastName: z.string().max(60).optional(),
  profileImageUrl: z.string().max(255).optional(),
  bannerImageUrl: z.string().max(255).optional(),
  bio: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  gender: genderEnum.optional(),
  region: regionEnum.optional(),
  favoriteGameGenre: gameGenreEnum.optional(),
  playerType: playerTypeEnum.optional(),
  industryRole: industryRoleEnum.optional(),
  lookingFor: lookingForEnum.optional(),
  presenceStatus: presenceStatusEnum.optional(),
  rowVersion: z.string(), // Required for optimistic concurrency
});

// Response DTO - includes all fields
export const userProfileResponseDto = z.object({
  id: z.string(),
  userKeycloakId: z.string(),
  userName: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  bannerImageUrl: z.string().nullable(),
  bio: z.string().nullable(),
  birthDate: z.string().nullable(),
  gender: genderEnum,
  region: regionEnum,
  favoriteGameGenre: gameGenreEnum,
  playerType: playerTypeEnum,
  industryRole: industryRoleEnum,
  lookingFor: lookingForEnum,
  presenceStatus: presenceStatusEnum,
  lastOnline: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
  rowVersion: z.string(),
});

export type CreateUserProfileDto = z.infer<typeof createUserProfileDto>;
export type UpdateUserProfileDto = z.infer<typeof updateUserProfileDto>;
export type UserProfileResponseDto = z.infer<typeof userProfileResponseDto>;
