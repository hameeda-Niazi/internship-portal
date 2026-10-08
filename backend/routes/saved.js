import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { listSaved, toggleSaved } from '../controllers/savedController.js';
import asyncHandler from '../middleware/asyncHandler.js';
const router = Router();
router.use(protect, authorize('user'));
router.get('/', asyncHandler(listSaved));
router.put('/:internshipId', asyncHandler(toggleSaved));
export default router;
