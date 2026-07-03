import { Router } from 'express';
import { deleteReview } from '../controllers/reviews.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idSchema } from '../schemas/validation.js';

const router = Router();
router.delete('/:id', auth, validate(idSchema), deleteReview);
export default router;
