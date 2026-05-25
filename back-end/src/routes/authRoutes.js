import { Router } from 'express';
import { registerMock, loginMock, logoutMock } from '../controllers/authController.js';

const router = Router();

router.post('/register', registerMock);
router.post('/login', loginMock);
router.post('/logout', logoutMock);

export default router;