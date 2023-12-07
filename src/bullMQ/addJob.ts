import { Queue } from 'bullmq';

export const addJob = (bullQueue: Queue<any, any, string>, name: string, input: any, attempts = 3, delay = 30 * 1000) => {
  bullQueue.add(name, input, { 
    attempts,
    backoff: {
      type: 'exponential',
      delay
    },
  })
}