import { fastify, type FastifyInstance } from 'fastify';
import { config, env } from './config.js';
import { getLogger } from './log.js';

export function app() {
  return fastify({
    disableRequestLogging: true,
    logger: getLogger(env(process.env.NODE_ENV), process.env.LOG_LEVEL),
    pluginTimeout: 60_000,
  });
}

export async function setup(app: FastifyInstance) {
  await app.register(import('@fastify/env'), config);
  app.log.info('[Plugin]: [@fastify/env] loaded');

  // await app.register(helloPLugin);
  // app.log.info('[Plugin]: [hello] loaded');

  await app.ready();
  app.log.info('[App]: Ready');

  return app;
}
