import { Router } from 'express';
import {
  changePassword, getUser, invite, login, logout, onboardCompany, refresh,
  register, removeUser, updatePersonal, uploadLogo, validateEmail
} from '../controllers/user.controller.js';
import { allowRoles, auth } from '../middleware/auth.middleware.js';
import { uploadLogo as logoMiddleware } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  companySchema, deleteSchema, inviteSchema, loginSchema, passwordSchema,
  personalSchema, refreshSchema, registerSchema, validationSchema
} from '../validators/user.validator.js';

const router = Router();
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.put('/validation', auth, validate(validationSchema), validateEmail);
router.put('/register', auth, validate(personalSchema), updatePersonal);
router.patch('/company', auth, validate(companySchema), onboardCompany);
router.patch('/logo', auth, logoMiddleware, uploadLogo);
router.get('/', auth, getUser);
router.post('/logout', auth, logout);
router.delete('/', auth, validate(deleteSchema), removeUser);
router.put('/password', auth, validate(passwordSchema), changePassword);
router.post('/invite', auth, allowRoles('admin'), validate(inviteSchema), invite);
export default router;
