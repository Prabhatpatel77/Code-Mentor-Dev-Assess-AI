import express from 'express';
import {
  getPlatformOverview,
  getStudentList,
  getIndividualStudentReport,
  getSystemHealth,
  getSystemArchitecture
} from '../controllers/adminController.js';
import { adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(adminProtect);

router.get('/overview', getPlatformOverview);
router.get('/students', getStudentList);
router.get('/students/:id/progress', getIndividualStudentReport);
router.get('/system/health', getSystemHealth);
router.get('/system/architecture', getSystemArchitecture);

export default router;
