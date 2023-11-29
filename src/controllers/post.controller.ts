import { NextFunction, Request, Response } from 'express';

export const findPostHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = {
      title: 'This is post #1',
      body: 'This is the body of the post',
    };
    res.status(200).json({
      status: 'success',
      data: {
        post,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const findAllPostsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = [
      {
        title: 'This is post #1',
        body: 'This is the body of the post',
      },
      {
        title: 'This is post #2',
        body: 'This is the body of the post',
      }
    ];
    res.status(200).json({
      status: 'success',
      result: posts.length,
      data: {
        posts,
      },
    });
  } catch (err: any) {
    next(err);
  }
};
