import { Router } from 'express';
import { allLoans, createLoan, myLoans, returnLoan } from '../controllers/loans.controller.js';
import { allowRoles, auth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idSchema, loanSchema } from '../schemas/validation.js';

const router = Router();
router.use(auth);
router.get('/all', allowRoles('LIBRARIAN', 'ADMIN'), allLoans);
router.get('/', myLoans);
router.post('/', validate(loanSchema), createLoan);
router.put('/:id/return', validate(idSchema), returnLoan);
export default router;
