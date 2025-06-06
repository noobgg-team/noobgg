import { OpenAPIHono } from "@hono/zod-openapi";
import {
  createLanguage,
  getLanguages,
  getAllLanguages,
  getLanguageById,
  updateLanguage,
  deleteLanguage,
} from '../controllers/languages.controller';

const languagesRoutes = new OpenAPIHono();

// Route definitions for Hono
// Note: Express-style res, req handlers from languages.controller.ts
// are generally compatible with Hono. Hono's context `c` provides
// `c.req` (for Request) and `c.json` (for sending response),
// which the Express adapter in Hono handles.
// If controllers were strictly Hono (e.g. `(c: Context) => c.json(...)`),
// they would also work. The current controllers use Express types (req: Request, res: Response).
// Hono's app.use / app.route should correctly adapt these.

languagesRoutes.post('/', createLanguage);
languagesRoutes.get('/', getLanguages);
languagesRoutes.get('/all', getAllLanguages);
languagesRoutes.get('/:id', getLanguageById);
languagesRoutes.put('/:id', updateLanguage);
languagesRoutes.delete('/:id', deleteLanguage);

export default languagesRoutes;
