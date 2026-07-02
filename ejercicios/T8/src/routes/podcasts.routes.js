import { Router } from 'express';
import {
  createPodcast,
  deletePodcast,
  getAllPodcasts,
  getPodcast,
  getPodcasts,
  togglePublished,
  updatePodcast
} from '../controllers/podcasts.controller.js';
import auth from '../middleware/session.middleware.js';
import checkRol from '../middleware/rol.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createPodcastSchema,
  idParamSchema,
  updatePodcastSchema
} from '../validators/podcast.validator.js';

const router = Router();

/**
 * @openapi
 * /api/podcasts:
 *   get:
 *     tags: [Podcasts]
 *     summary: Lista los podcasts publicados
 *     responses:
 *       200: { description: Lista de podcasts }
 *   post:
 *     tags: [Podcasts]
 *     summary: Crea un podcast
 *     security: [{ BearerToken: [] }]
 *     responses:
 *       201: { description: Podcast creado }
 */
router.get('/', getPodcasts);
router.post('/', auth, validate(createPodcastSchema), createPodcast);

/**
 * @openapi
 * /api/podcasts/admin/all:
 *   get:
 *     tags: [Podcasts]
 *     summary: Lista todos los podcasts
 *     security: [{ BearerToken: [] }]
 *     responses:
 *       200: { description: Lista completa }
 */
router.get('/admin/all', auth, checkRol(['admin']), getAllPodcasts);
router.patch('/:id/publish', auth, checkRol(['admin']), validate(idParamSchema), togglePublished);
router.get('/:id', validate(idParamSchema), getPodcast);
router.put('/:id', auth, validate(idParamSchema), validate(updatePodcastSchema), updatePodcast);
router.delete('/:id', auth, checkRol(['admin']), validate(idParamSchema), deletePodcast);

export default router;

