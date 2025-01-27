import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { JSONSchemaType } from 'env-schema';
import path from 'path';
import * as url from 'url';
import * as dbSchema from './db/schemas/index.js';

declare module 'fastify' {
  export interface FastifyInstance {
    readonly config: Config;
    db: PostgresJsDatabase<typeof dbSchema>;
  }
}

export enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export interface Config {
  LOG_LEVEL: string;
  PORT: number;
  POSTGRES_DB: string;
  POSTGRES_HOST: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
}

export const env = (env?: string): Env => {
  switch (env) {
    case Env.PRODUCTION:
    case Env.TEST:
      return env;
    default:
      return Env.DEVELOPMENT;
  }
};

const schema: JSONSchemaType<Config> = {
  type: 'object',
  properties: {
    LOG_LEVEL: { type: 'string', default: 'info' },
    PORT: { type: 'number', default: 3001 },
    POSTGRES_DB: { type: 'string', default: 'postgres' },
    POSTGRES_HOST: { type: 'string', default: 'localhost' },
    POSTGRES_PASSWORD: { type: 'string', default: 'postgres' },
    POSTGRES_PORT: { type: 'number', default: 5432 },
    POSTGRES_USER: { type: 'string', default: 'postgres' },
  },
  required: [],
};

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const config = {
  schema,
  dotenv: {
    path: path.join(__dirname, '..', '.env'),
  },
};
