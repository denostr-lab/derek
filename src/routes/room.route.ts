import express from 'express';
import {
  findEventsHandler,
  saveEventHandler,
  deleteEventHandler
} from '@/controllers/event.controller';
import { deserializeUser } from '@/middleware/deserializeUser';
import { requireUser } from '@/middleware/requireUser';

const router = express.Router();

router.use(deserializeUser, requireUser);

// Get random post route
router.get('/list', findEventsHandler);
router.post('/create', saveEventHandler);
router.post('/delete', deleteEventHandler);


export default router;
