import { Router } from 'express';
import * as project from '../controllers/project.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { idSchema, projectSchema, projectUpdateSchema } from '../validators/resource.validator.js';

const router = Router();
router.use(auth);
router.post('/', validate(projectSchema), project.create);
router.get('/', project.list);
router.get('/archived', project.archived);
router.get('/:id', validate(idSchema), project.getOne);
router.put('/:id', validate(projectUpdateSchema), project.update);
router.delete('/:id', validate(idSchema), project.remove);
router.patch('/:id/restore', validate(idSchema), project.restore);
export default router;
