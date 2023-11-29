import { Application } from 'express';
import authRouter from './auth.route';
import userRouter from './user.route';
import postRouter from './post.route';

function init(app: Application) {
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/posts', postRouter);
}

export default {
  init,
};