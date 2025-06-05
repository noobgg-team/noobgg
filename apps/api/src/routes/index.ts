import { Hono } from "hono";
import { homeController } from "../controllers/main.controller";
import anyRoutes from "./any-route";
import gamesRoutes from "./games";
import distributorsRoutes from "./distributors";
import platformsRoutes from "./platforms";
import { queryParingMiddleware } from "../middlewares";

const router = new Hono();

// Middlewares
router.use(queryParingMiddleware);

// Routes
router.get("/", homeController);
router.route("/", anyRoutes);
router.route("/", gamesRoutes);
router.route("/", distributorsRoutes);
router.route("/", platformsRoutes);

export default router;
