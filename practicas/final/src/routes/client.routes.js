import { Router } from 'express';
import * as client from '../controllers/client.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { clientSchema, clientUpdateSchema, idSchema } from '../validators/resource.validator.js';

const router = Router();
router.use(auth);
router.post('/', validate(clientSchema), client.create);
router.get('/', client.list);
router.get('/archived', client.archived);
router.get('/:id', validate(idSchema), client.getOne);
router.put('/:id', validate(clientUpdateSchema), client.update);
router.delete('/:id', validate(idSchema), client.remove);
router.patch('/:id/restore', validate(idSchema), client.restore);
export default router;
