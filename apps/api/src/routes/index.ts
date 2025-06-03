import { Hono } from "hono";
import { homeController } from "../controllers/main.controller";
import anyRoutes from "./any-route";

const router = new Hono();

router.get("/", homeController);
router.route("/", anyRoutes);

export default router;
