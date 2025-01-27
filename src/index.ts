import closeWithGrace from 'close-with-grace';
import { app, setup } from './app.js';

const server = app();

try {
  await setup(server);
  await server.listen({
    host: '0.0.0.0',
    listenTextResolver: (address) => `[App]: Listening at ${address}`,
    port: server.config.PORT,
  });

  closeWithGrace({ logger: server.log }, async ({ err }) => {
    if (err) {
      server.log.error(err);
    }
    server.log.info('[App]: Closing...');
    await server.close();
    server.log.info('[App]: Closed');
  });
} catch (e) {
  server.log.error(e);
  process.exit(1);
}
