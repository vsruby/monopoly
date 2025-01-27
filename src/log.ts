import type { Env } from './config.js';

export const getLogger = (env: Env, logLevel?: string) => {
  const level = logLevel || 'info';
  switch (env) {
    case 'development':
      return { ...prettyLogger, level };
    case 'production':
      return { level };
    case 'test':
      return { ...prettyLogger, level: 'error' };
    default:
      return false;
  }
};

const prettyLogger = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
};
