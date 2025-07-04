export { exampleSchema } from "./schemas/example-schema";
export {
  createPlatformSchema,
  updatePlatformSchema,
} from "./schemas/platform.schema";

export {
  createDistributorSchema,
  updateDistributorSchema,
} from "./schemas/distributor.schema";

export {
  createUserProfileSchema,
  updateUserProfileSchema,
} from "./schemas/user-profile.schema";

export { createGameSchema, updateGameSchema } from "./schemas/game.schema";

export {
  createGameRankSchema,
  updateGameRankSchema,
} from "./schemas/gamerank.schema";

export * from "./schemas/event-attendees";

export * from "./schemas/event-invitations";

// OpenAPI Response Schemas
export {
  ErrorResponseSchema,
  GameResponseSchema,
  GamesListResponseSchema,
  DistributorResponseSchema,
  DistributorsListResponseSchema,
  PlatformResponseSchema,
  PlatformsListResponseSchema,
  GameRankResponseSchema,
  GameRanksListResponseSchema,
  IdParamSchema,
  SuccessResponseSchema,
} from "./schemas/openapi-responses.schema";

export {
  createLanguageSchema,
  updateLanguageSchema,
  getLanguagesSchema,
} from "./schemas/languages";

export * from "./dto/language.dto";
export * from "./dto/game.dto";
export * from "./dto/game-rank.dto";
export * from "./dto/distributor.dto";
export * from "./dto/platform.dto";
export * from "./dto/user-profile.dto";
export * from "./dto/event-attendee.dto";
export * from "./dto/event-invitation.dto";
export * from "./dto/event.dto";
export * from "./dto/lobby.dto";
export * from "./dto/game-mode.dto";
export * from "./dto/game-region.dto";
export * from "./dto/lobby-language.dto";
export * from "./dto/lobby-member.dto";
export * from "./dto/game-distributor.dto";
export * from "./dto/game-platform.dto";
export * from "./dto/user-social-link.dto";

export type { Language } from "./schemas/languages";
