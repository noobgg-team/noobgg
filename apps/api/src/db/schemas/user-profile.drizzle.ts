import { pgTable, bigint, timestamp, text, pgEnum,varchar } from 'drizzle-orm/pg-core';

// Enums
export const genderEnum = pgEnum('gender', ['male', 'female', 'unknown']);
export const regionEnum = pgEnum('region', [
  'north_america',
  'south_america',
  'europe',
  'asia',
  'oceania',
  'middle_east',
  'africa',
  'russia_cis',
  'unknown',
]);
export { regionEnum as regionTypeEnum };

// New enums for user profile
export const gameGenreEnum = pgEnum('game_genre', [
  'action',
  'adventure',
  'battle_royale',
  'fighting',
  'fps',
  'mmorpg',
  'moba',
  'platformer',
  'puzzle',
  'racing',
  'rpg',
  'rts',
  'simulation',
  'sports',
  'strategy',
  'survival',
  'unknown',
]);

export const playerTypeEnum = pgEnum('player_type', [
  'casual',
  'competitive',
  'professional',
  'content_creator',
  'coach',
  'unknown',
]);

export const industryRoleEnum = pgEnum('industry_role', [
  'player',
  'developer',
  'publisher',
  'esports_org',
  'tournament_organizer',
  'content_creator',
  'journalist',
  'analyst',
  'coach',
  'manager',
  'unknown',
]);

export const lookingForEnum = pgEnum('looking_for', [
  'teammates',
  'friends',
  'guild',
  'coach',
  'students',
  'scrims',
  'tournaments',
  'casual_play',
  'unknown',
]);

export const presenceStatusEnum = pgEnum('presence_status', [
  'online',
  'offline',
  'away',
  'do_not_disturb',
  'invisible',
  'unknown',
]);


// UserProfile table
export const userProfiles = pgTable('user_profiles', {
  id: bigint('id', { mode: 'bigint' }).primaryKey().generatedAlwaysAsIdentity(),
  userKeycloakId: varchar('user_keycloak_id', { length: 100 }).notNull().unique(),

  // timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  lastOnline: timestamp('last_online', { withTimezone: true }).notNull().defaultNow(),

  // basic profile
  birthDate: timestamp('birth_date', { withTimezone: true }),
  userName: varchar('user_name', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 60 }),
  lastName: varchar('last_name', { length: 60 }),
  profileImageUrl: varchar('profile_image_url', { length: 255 }),
  bannerImageUrl: varchar('banner_image_url', { length: 255 }),
  bio: text('bio'),

  // enums (definitions already exist)
  gender: genderEnum('gender').notNull().default('unknown'),
  region: regionEnum('region').notNull().default('unknown'),
  favoriteGameGenre: gameGenreEnum('favorite_game_genre').notNull().default('unknown'),
  playerType: playerTypeEnum('player_type').notNull().default('unknown'),
  industryRole: industryRoleEnum('industry_role').notNull().default('unknown'),
  lookingFor: lookingForEnum('looking_for').notNull().default('unknown'),
  presenceStatus: presenceStatusEnum('presence_status').notNull().default('unknown'),

  // optimistic concurrency
  rowVersion: text('row_version').notNull().$defaultFn(() => '0'),
});
