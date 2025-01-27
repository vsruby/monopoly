import type { FastifyInstance } from 'fastify';
import type { SetupServer } from 'msw/node';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { MockLogger } from './mocks/logger.js';

declare module 'vitest' {
  export interface TestContext {
    buildApp: () => Promise<FastifyInstance>;
    server: typeof server;
    app?: FastifyInstance;
  }
}

const server: SetupServer = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

beforeEach(async (context) => {
  context.buildApp = async () => {
    const { app, setup } = await import('../src/app.js');
    context.app = await setup(app());
    context.app.log = new MockLogger();
    return context.app;
  };
  context.server = server;
});

afterEach((context) => {
  context.server.resetHandlers();
  return context.app?.close();
});
