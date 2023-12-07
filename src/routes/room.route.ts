import express from 'express';
import { readRoomMessageHandler, roomsHandler } from '@/controllers/room.controller';

const router = express.Router();

// router.use(deserializeUser, requireUser);

router.get('/:pubkey', roomsHandler);
router.post('/read', readRoomMessageHandler);

export default router;
