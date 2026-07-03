import { Router } from 'express';
import { createRoom, history, listRooms } from '../controllers/rooms.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(auth);
router.get('/', listRooms);
router.post('/', createRoom);
router.get('/:id/messages', history);
export default router;
