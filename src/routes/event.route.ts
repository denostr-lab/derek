import express from 'express';
import {
  findEventsHandler,

  saveEventHandler,
  deleteEventHandler
} from '@/controllers/event.controller';
// import { deserializeUser } from '@/middleware/deserializeUser';
// import { requireUser } from '@/middleware/requireUser';

const router = express.Router();

// router.use(deserializeUser, requireUser);

router.post('/query', findEventsHandler);
router.post('/save', saveEventHandler);
router.post('/delete', deleteEventHandler);


export default router;
