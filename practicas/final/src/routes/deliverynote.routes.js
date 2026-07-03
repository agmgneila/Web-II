import { Router } from 'express';
import * as delivery from '../controllers/deliverynote.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { signatureUpload } from '../middleware/signature-upload.js';
import { validate } from '../middleware/validate.js';
import { deliverySchema, idSchema } from '../validators/resource.validator.js';

const router = Router();
router.use(auth);
router.post('/', validate(deliverySchema), delivery.create);
router.get('/', delivery.list);
router.get('/pdf/:id', validate(idSchema), delivery.pdf);
router.get('/:id', validate(idSchema), delivery.getOne);
router.patch('/:id/sign', validate(idSchema), signatureUpload, delivery.sign);
router.delete('/:id', validate(idSchema), delivery.remove);
export default router;
