import { Router } from 'express';
import mockAuth from '../middlewares/mockAuth.js';
import {
  getHistoryMock,
  getHistorySummaryMock,
  getHistoryBySessionIdMock,
} from '../controllers/historyController.js';

const router = Router();

// Protected routes
router.get('/', mockAuth, getHistoryMock);
router.get('/summary', mockAuth, getHistorySummaryMock);
router.get('/:sessionId', mockAuth, getHistoryBySessionIdMock);

export default router;