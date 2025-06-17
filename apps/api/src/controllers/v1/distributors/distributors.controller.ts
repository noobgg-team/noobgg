import { Context } from "hono";
import { ApiError } from "../../../middleware/errorHandler";
import { createDistributorDto, updateDistributorDto } from "@repo/shared/dto/distributor.dto";
import * as service from "./distributors.service";

export const getAllDistributorsController = async (c: Context) => {
  const distributors = await service.getAllDistributors();
  return c.json(distributors);
};

export const getDistributorByIdController = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) throw new ApiError("Invalid id", 400);

  const distributor = await service.getDistributorById(id);
  if (distributor.length === 0) throw new ApiError("Distributor not found", 404);

  return c.json(distributor[0]);
};

export const createDistributorController = async (c: Context) => {
  const data = await c.req.json();
  const result = createDistributorDto.safeParse(data);
  if (!result.success) throw new ApiError(JSON.stringify(result.error.flatten().fieldErrors), 400);

  const distributor = await service.createDistributor(result.data);
  return c.json(distributor, 201);
};

export const updateDistributorController = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) throw new ApiError("Invalid id", 400);

  const data = await c.req.json();
  const result = updateDistributorDto.safeParse(data);
  if (!result.success) throw new ApiError(JSON.stringify(result.error.flatten().fieldErrors), 400);

  const distributor = await service.updateDistributor(id, result.data);
  if (!distributor) throw new ApiError("Distributor not found", 404);

  return c.json(distributor);
};

export const deleteDistributorController = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) throw new ApiError("Invalid id", 400);

  const distributor = await service.deleteDistributor(id);
  if (!distributor) throw new ApiError("Distributor not found", 404);

  return c.json(distributor);
};