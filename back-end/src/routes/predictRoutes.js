import { Router } from 'express';
import { uploadAudio } from '../middlewares/uploadAudio.js';
import { mockPredict } from '../controllers/predictController.js';

const router = Router();

// Field name dari FE: "audio"
router.post('/', uploadAudio, mockPredict);

export default router;