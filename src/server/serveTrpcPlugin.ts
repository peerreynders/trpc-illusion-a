import { makeTrpcMiddleware } from './middleware';

import type { ViteDevServer } from 'vite';

export default function serveTrpcPlugin() {
  return {
    name: 'configure-server',
    configureServer(server: ViteDevServer) {
      // Pre-internal middleware here:
      server.middlewares.use(makeTrpcMiddleware(server.httpServer));

      // Post internal middleware should be registered
      // in a returned thunk, e.g.:
      // () => server.middlewares.use(makeTrpcMiddleware());
      return;
    },
  };
}
