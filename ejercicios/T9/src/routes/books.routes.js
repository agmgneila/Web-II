import { Router } from 'express';
import {
  createBook, deleteBook, getBook, listBooks, updateBook
} from '../controllers/books.controller.js';
import { createReview, listReviews } from '../controllers/reviews.controller.js';
import { allowRoles, auth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  bookSchema, idSchema, reviewSchema, updateBookSchema
} from '../schemas/validation.js';

const router = Router();
router.get('/', listBooks);
router.post('/', auth, allowRoles('LIBRARIAN', 'ADMIN'), validate(bookSchema), createBook);
router.get('/:id/reviews', validate(idSchema), listReviews);
router.post('/:id/reviews', auth, validate(reviewSchema), createReview);
router.get('/:id', validate(idSchema), getBook);
router.put('/:id', auth, allowRoles('LIBRARIAN', 'ADMIN'), validate(updateBookSchema), updateBook);
router.delete('/:id', auth, allowRoles('ADMIN'), validate(idSchema), deleteBook);
export default router;
