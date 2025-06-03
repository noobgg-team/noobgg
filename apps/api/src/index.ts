import { Hono } from "hono";
import { exampleSchema } from "@repo/shared";
import router from "./routes";

// burada ortak paketi çektik

const app = new Hono();

app.route("/", router);

export default app;
