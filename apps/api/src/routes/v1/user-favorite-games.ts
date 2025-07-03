import { Hono } from "hono";
import {
  addFavoriteGame,
  removeFavoriteGame,
  getFavoriteGames,
} from "../../controllers/v1/user-favorite-games.controller";

const userFavoriteGamesRouter = new Hono();

// POST /api/v1/user-profiles/:userId/favorite-games
userFavoriteGamesRouter.post("/", addFavoriteGame);

// DELETE /api/v1/user-profiles/:userId/favorite-games/:gameId
userFavoriteGamesRouter.delete("/:gameId", removeFavoriteGame);

// GET /api/v1/user-profiles/:userId/favorite-games
userFavoriteGamesRouter.get("/", getFavoriteGames);

export default userFavoriteGamesRouter;