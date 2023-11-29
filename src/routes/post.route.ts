import express from 'express';
import {
  findAllPostsHandler,
  findPostHandler,
} from '@/controllers/post.controller';
import { deserializeUser } from '@/middleware/deserializeUser';
import { requireUser } from '@/middleware/requireUser';
import { restrictTo } from '@/middleware/restrictTo';

const router = express.Router();

router.use(deserializeUser, requireUser);

// Admin Get Posts route
router.get('/', restrictTo('admin'), findAllPostsHandler);

// Get random post route
router.get('/random', findPostHandler);

export default router;
