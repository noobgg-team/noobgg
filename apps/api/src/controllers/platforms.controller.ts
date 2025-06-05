import { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { platforms } from "../db/schemas/platforms.drizzle";
import {
  createPlatformSchema,
  updatePlatformSchema,
} from "../lib/zod-schemas/platforms";
import * as crudService from "../crud.service";
import { serialize } from "../lib/utils";

export const getAllPlatformsController = async (c: Context) => {
  try {
    const queryOptions = c.get("queryOptions");

    const result = await crudService.getAllItems(platforms, queryOptions);
    return c.json(serialize(result));
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};

export const getPlatformByIdController = async (c: Context) => {
  try {
    const idParam = c.req.param("id");
    if (!idParam || !/^\d+$/.test(idParam)) {
      return c.json({ error: "Invalid id" }, 400);
    }
    const id = BigInt(idParam);

    const result = await crudService.getItemById(id, platforms);
    if (result.length === 0)
      return c.json({ error: "Platform not found" }, 404);
    return c.json(serialize(result[0]));
  } catch {
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const createPlatformController = async (c: Context) => {
  try {
    const data = await c.req.json();
    const result = createPlatformSchema.safeParse(data);
    if (!result.success) {
      return c.json({ error: result.error.flatten().fieldErrors }, 400);
    }

    const [platform] = await crudService.createItem(result.data, platforms);
    return c.json(serialize(platform), 201);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};

export const updatePlatformController = async (c: Context) => {
  try {
    const idParam = c.req.param("id");
    if (!idParam || !/^\d+$/.test(idParam)) {
      return c.json({ error: "Invalid id" }, 400);
    }
    const id = BigInt(idParam);

    const data = await c.req.json();
    const result = updatePlatformSchema.safeParse(data);
    if (!result.success) {
      return c.json({ error: result.error.flatten().fieldErrors }, 400);
    }
    if (Object.keys(result.data).length === 0) {
      return c.json({ error: "No data provided" }, 400);
    }

    const [platform] = await crudService.updateItem(id, result.data, platforms);

    if (!platform) return c.json({ error: "Platform not found" }, 404);
    return c.json(serialize(platform));
  } catch {
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const deletePlatformController = async (c: Context) => {
  try {
    const idParam = c.req.param("id");
    if (!idParam || !/^\d+$/.test(idParam)) {
      return c.json({ error: "Invalid id" }, 400);
    }
    const id = BigInt(idParam);

    const [platform] = await crudService.deleteItem(id, platforms);

    if (!platform) return c.json({ error: "Platform not found" }, 404);
    return c.json(serialize(platform));
  } catch {
    return c.json({ error: "Internal server error" }, 500);
  }
};
