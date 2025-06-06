import { Router } from 'express';
import {
  createLanguage,
  getLanguages,
  getAllLanguages,
  getLanguageById,
  updateLanguage,
  deleteLanguage,
} from '../controllers/languages.controller';

const router = Router();

router.post('/', createLanguage);
router.get('/', getLanguages);
router.get('/all', getAllLanguages);
router.get('/:id', getLanguageById);
router.put('/:id', updateLanguage);
router.delete('/:id', deleteLanguage);

export default router;
