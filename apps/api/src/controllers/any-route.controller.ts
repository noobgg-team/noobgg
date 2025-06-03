import { Context } from "hono";

export const anyRouteGetController = (c: Context) => {
  return c.text("Hello Any Route!");
};

export const anyRoutePostController = (c: Context) => {
  return c.text("Hello Any Route!");
};
