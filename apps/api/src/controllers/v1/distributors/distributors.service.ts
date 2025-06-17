import { db } from "../../../db";
import { distributorsTable } from "./distributors.model";
import { eq } from "drizzle-orm";

export async function getAllDistributors() {
  return db.select().from(distributorsTable);
}

export async function getDistributorById(id: number) {
  return db.select().from(distributorsTable).where(eq(distributorsTable.id, id));
}

export async function createDistributor(data: any) {
  const [distributor] = await db.insert(distributorsTable).values(data).returning();
  return distributor;
}

export async function updateDistributor(id: number, data: any) {
  const [distributor] = await db.update(distributorsTable).set(data).where(eq(distributorsTable.id, id)).returning();
  return distributor;
}

export async function deleteDistributor(id: number) {
  const [distributor] = await db.delete(distributorsTable).where(eq(distributorsTable.id, id)).returning();
  return distributor;
}
