import { db } from "../../../db";
import { eventAttendees } from "./eventAttendees.model";
import { eq, and, isNull, desc, sql } from "drizzle-orm";

export async function listEventAttendees(page: number, limit: number) {
  const offset = (page - 1) * limit;
  const data = await db
    .select()
    .from(eventAttendees)
    .where(isNull(eventAttendees.deletedAt))
    .orderBy(desc(eventAttendees.createdAt))
    .limit(limit)
    .offset(offset);
  const total = await db
    .select({ count: sql`count(*)` })
    .from(eventAttendees)
    .where(isNull(eventAttendees.deletedAt));
  return { data, total: Number(total[0].count) };
}

export async function getAttendeeById(id: bigint) {
  return db
    .select()
    .from(eventAttendees)
    .where(and(eq(eventAttendees.id, id), isNull(eventAttendees.deletedAt)))
    .limit(1);
}

export async function listEventAttendeesByEvent(eventId: bigint, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const data = await db
    .select()
    .from(eventAttendees)
    .where(and(eq(eventAttendees.eventId, eventId), isNull(eventAttendees.deletedAt)))
    .orderBy(desc(eventAttendees.joinedAt))
    .limit(limit)
    .offset(offset);
  const total = await db
    .select({ count: sql`count(*)` })
    .from(eventAttendees)
    .where(and(eq(eventAttendees.eventId, eventId), isNull(eventAttendees.deletedAt)));
  return { data, total: Number(total[0].count) };
}

export async function createEventAttendeeRecord(eventId: bigint, userProfileId: bigint, joinedAt?: Date) {
  return db.insert(eventAttendees).values({
    eventId,
    userProfileId,
    joinedAt: joinedAt || new Date(),
  }).returning();
}

export async function softDeleteAttendee(id: bigint) {
  return db.update(eventAttendees).set({
    deletedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(eventAttendees.id, id)).returning();
}

export async function checkAlreadyAttending(eventId: bigint, userProfileId: bigint) {
  return db
    .select()
    .from(eventAttendees)
    .where(and(
      eq(eventAttendees.eventId, eventId),
      eq(eventAttendees.userProfileId, userProfileId),
      isNull(eventAttendees.deletedAt)
    ))
    .limit(1);
}