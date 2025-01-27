import { type Config } from 'drizzle-kit';

export default {
  dialect: 'postgresql',
  // TODO: switch to env
  dbCredentials: {
    url: 'postgresql://postgres:postgres@localhost:5432/postgres',
  },
  out: './src/db/migrations',
  schema: './src/db/schemas/index.ts',
} satisfies Config;
