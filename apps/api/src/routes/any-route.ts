import { Hono } from "hono";
import {
  anyRouteGetController,
  anyRoutePostController,
} from "../controllers/any-route.controller";

const anyRoute = new Hono().basePath("/any-route");
anyRoute.get("/", anyRouteGetController);
anyRoute.post("/", anyRoutePostController);

export default anyRoute;
