import { Application } from 'express';
import authRouter from './auth.route';
import userRouter from './user.route';
import postRouter from './post.route';
import eventRouter from './event.route';

function init(app: Application) {
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/posts', postRouter);
  app.use('/api/events', eventRouter);

}

export default {
  init,
};