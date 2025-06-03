import { Context } from "hono";

export const homeController = (c: Context) => {
  return c.text("Hello Hono!");
};
