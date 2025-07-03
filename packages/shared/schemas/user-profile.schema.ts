import {z} from 'zod';
import {
  genderEnum,
  regionEnum,
  gameGenreEnum,
  playerTypeEnum,
  industryRoleEnum,
  lookingForEnum,
  presenceStatusEnum,
} from '../../../apps/api/src/db/schemas/user-profile.drizzle';

export const createUserProfileSchema = z.object({
  userKeycloakId: z
    .string()
    .min(1)
    .max(100),
  birthDate: z
    .coerce
    .date()
    .optional(),
  userName: z
    .string()
    .min(1)
    .max(50)
    .trim(),
  firstName: z
    .string()
    .max(60)
    .trim()
    .optional(),
  lastName: z
    .string()
    .max(60)
    .trim()
    .optional(),
  profileImageUrl: z
    .string()
    .url()
    .max(255)
    .optional(),
  bannerImageUrl: z
    .string()
    .url()
    .max(255)
    .optional(),
  bio: z
    .string()
    .max(500)
    .optional(),

  gender: z
    .enum(genderEnum.enumValues)
    .default('unknown'),
  region: z
    .enum(regionEnum.enumValues)
    .default('unknown'),
  favoriteGameGenre: z
    .enum(gameGenreEnum.enumValues)
    .default('unknown'),
  playerType: z
    .enum(playerTypeEnum.enumValues)
    .default('unknown'),
  industryRole: z
    .enum(industryRoleEnum.enumValues)
    .default('unknown'),
  lookingFor: z
    .enum(lookingForEnum.enumValues)
    .default('unknown'),
  presenceStatus: z
    .enum(presenceStatusEnum.enumValues)
    .default('unknown'),
});

export const updateUserProfileSchema = z.object({
  userKeycloakId: z
    .string()
    .min(1)
    .max(100)
    .optional(),
  birthDate: z
    .coerce
    .date()
    .optional(),
  userName: z
    .string()
    .min(1)
    .max(50)
    .trim()
    .optional(),
  firstName: z
    .string()
    .max(60)
    .trim()
    .optional(),
  lastName: z
    .string()
    .max(60)
    .trim()
    .optional(),
  profileImageUrl: z
    .string()
    .url()
    .max(255)
    .optional(),
  bannerImageUrl: z
    .string()
    .url()
    .max(255)
    .optional(),
  bio: z
    .string()
    .max(500)
    .optional(),

  gender: z
    .enum(genderEnum.enumValues)
    .optional(),
  region: z
    .enum(regionEnum.enumValues)
    .optional(),
  favoriteGameGenre: z
    .enum(gameGenreEnum.enumValues)
    .optional(),
  playerType: z
    .enum(playerTypeEnum.enumValues)
    .optional(),
  industryRole: z
    .enum(industryRoleEnum.enumValues)
    .optional(),
  lookingFor: z
    .enum(lookingForEnum.enumValues)
    .optional(),
  presenceStatus: z
    .enum(presenceStatusEnum.enumValues)
    .optional(),
  
  rowVersion: z.string(),
});