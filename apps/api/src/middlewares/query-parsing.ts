import { Context } from "hono";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

// An example of a query string:
// ?page=1&limit=10&sort=name:asc,age:desc
// ?page=1&limit=10&sort=name:asc
export const queryParingMiddleware = async (
  c: Context,
  next: () => Promise<void>
) => {
  // PAGINATION PART
  let page = Number(c.req.query("page") ?? DEFAULT_PAGE);
  let limit = Number(c.req.query("limit") ?? DEFAULT_LIMIT);

  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  const offset = (page - 1) * limit;

  // SORTING PART
  // Sorting schema looks like this: sort=field1:asc,field2:desc
  const sortQuery = c.req.query("sort");
  const sort = parseSortQuery(sortQuery);

  c.set("queryOptions", {
    pagination: { page, limit, offset },
    sort,
  });

  await next();
};

function parseSortQuery(sortQuery: string | undefined) {
  if (!sortQuery) return null;
  const sort = [];
  const sortFields = sortQuery.split(",");
  for (const field of sortFields) {
    const [key, order = "asc"] = field.split(":");
    if (key && ["asc", "desc"].includes(order.toLowerCase())) {
      sort.push({ key, order: order.toLowerCase() });
    }
  }
  return sort.length > 0 ? sort : null;
}
