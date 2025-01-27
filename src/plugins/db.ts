import { drizzle } from 'drizzle-orm/postgres-js';
import { FastifyPluginAsync } from 'fastify';
import postgres from 'postgres';
import * as schema from '../db/schemas/index.js';

export const dbPlugin: FastifyPluginAsync = async (app) => {
  const dbUrl = `postgresql://${app.config.POSTGRES_USER}:${app.config.POSTGRES_PASSWORD}@${app.config.POSTGRES_HOST}:${app.config.POSTGRES_PORT}/${app.config.POSTGRES_DB}`;
  app.log.info(`[DB]: Connecting to ${dbUrl}`);

  const queryClient = postgres(dbUrl);
  const db = drizzle(queryClient, { schema });

  app.decorate('db', db);
};
