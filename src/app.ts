import { fastify, type FastifyInstance } from 'fastify';
import { config, env } from './config.js';
import { getLogger } from './log.js';
import { dbPlugin } from './plugins/db.js';
import { gamesPlugin } from './plugins/games.js';
import { usersPlugin } from './plugins/users.js';
import { playersPlugin } from './plugins/players.js';
import { actionsPlugin } from './plugins/actions.js';

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

  await app.register(dbPlugin);

  // register regular routes
  await app.register(actionsPlugin);
  await app.register(gamesPlugin);
  await app.register(playersPlugin);
  await app.register(usersPlugin);

  await app.ready();
  app.log.info('[App]: Ready');

  return app;
}
