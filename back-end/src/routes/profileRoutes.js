import { Router } from 'express';
import mockAuth from '../middlewares/mockAuth.js';
import { getProfileMock, updateProfileMock } from '../controllers/profileController.js';

const router = Router();

router.get('/', mockAuth, getProfileMock);
router.put('/', mockAuth, updateProfileMock);

export default router;