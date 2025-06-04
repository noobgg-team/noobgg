import { Router } from 'express';
import {
  createGameRank,
  getAllGameRanks,
  getGameRankById,
  updateGameRank,
  deleteGameRank,
} from '../controllers/game-ranks.controller';

const router = Router();

router.post('/', createGameRank);
router.get('/', getAllGameRanks);
router.get('/:id', getGameRankById);
router.put('/:id', updateGameRank);
router.delete('/:id', deleteGameRank);

export default router;
