import { PgTableWithColumns } from "drizzle-orm/pg-core";
import { db } from "./db";
import { asc, desc, eq } from "drizzle-orm";

type Table = PgTableWithColumns<any>;
type Id = number | bigint;

type SortRule = { key: string; order: "asc" | "desc" };
type Pagination = { page: number; limit: number; offset: number };
type QueryOptions = {
  pagination?: Pagination;
  sort?: SortRule[];
};

export async function getAllItems(table: Table, options?: QueryOptions) {
  let query: any = db.select().from(table);

  // Apply sorting if provided (sorting schema looks like this: sort=field1:asc,field2:desc)
  if (options?.sort) {
    const orderRules = options.sort.map((rule) =>
      rule.order === "asc" ? asc(table[rule.key]) : desc(table[rule.key])
    );
    query = query.orderBy(...orderRules);
  }

  // Apply pagination if provided
  if (options?.pagination) {
    query = query
      .offset(options.pagination.offset)
      .limit(options.pagination.limit);
  }

  const result = await query;
  return result;
}

export async function getItemById(id: Id, table: Table) {
  const result = await db.select().from(table).where(eq(table.id, id));
  return result;
}

export async function createItem<T extends Record<string, any>>(
  data: T,
  table: Table
) {
  const result = await db.insert(table).values(data).returning();
  return result;
}

export async function updateItem<T extends Record<string, any>>(
  id: Id,
  data: T,
  table: Table
) {
  const result = await db
    .update(table)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(table.id, id))
    .returning();
  return result;
}

export async function deleteItem(id: Id, table: Table) {
  const result = await db.delete(table).where(eq(table.id, id)).returning();
  return result;
}
