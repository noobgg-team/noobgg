import { Context } from "hono";
import * as service from "./eventAttendees.service";
import { convertBigIntToString } from "../../../utils/bigint-serializer";
import { createEventAttendeeDto } from "@repo/shared/dto/event-attendee.dto";
import { ApiError } from "../../../middleware/errorHandler";

export const getEventAttendees = async (c: Context) => {
  const page = Math.max(1, parseInt(c.req.query("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "10")));
  const { data, total } = await service.listEventAttendees(page, limit);
  return c.json({
    data: convertBigIntToString(data),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getEventAttendeeById = async (c: Context) => {
  const id = BigInt(c.req.param("id"));
  if (!id) throw new ApiError("Invalid ID", 400);
  const [attendee] = await service.getAttendeeById(id);
  if (!attendee) throw new ApiError("Event attendee not found", 404);
  return c.json({ data: convertBigIntToString(attendee) });
};

export const getEventAttendeesByEvent = async (c: Context) => {
  const eventId = BigInt(c.req.param("eventId"));
  if (!eventId) throw new ApiError("Invalid event ID", 400);
  const page = Math.max(1, parseInt(c.req.query("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "10")));
  const { data, total } = await service.listEventAttendeesByEvent(eventId, page, limit);
  return c.json({
    data: convertBigIntToString(data),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const createEventAttendee = async (c: Context) => {
  const body = await c.req.json();
  const result = createEventAttendeeDto.safeParse(body);
  if (!result.success) throw new ApiError(JSON.stringify(result.error.flatten().fieldErrors), 400);
  const { eventId, userProfileId, joinedAt } = result.data;

  const existing = await service.checkAlreadyAttending(BigInt(eventId), BigInt(userProfileId));
  if (existing.length > 0) throw new ApiError("User is already attending", 409);

  const [created] = await service.createEventAttendeeRecord(BigInt(eventId), BigInt(userProfileId), new Date(joinedAt || ""));
  return c.json({ data: convertBigIntToString(created) }, 201);
};

export const deleteEventAttendee = async (c: Context) => {
  const id = BigInt(c.req.param("id"));
  if (!id) throw new ApiError("Invalid ID", 400);
  const [existing] = await service.getAttendeeById(id);
  if (!existing) throw new ApiError("Not found", 404);

  const [deleted] = await service.softDeleteAttendee(id);
  if (!deleted) throw new ApiError("Failed to delete", 500);

  return c.json({ message: "Event attendee removed successfully" });
};