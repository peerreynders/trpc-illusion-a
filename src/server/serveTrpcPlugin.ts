import { makeTrpcMiddleware } from './middleware'

import type { ViteDevServer } from 'vite';

export default function serveTrpcPlugin() {
  return {
    name: 'configure-server',
    configureServer(server: ViteDevServer) {
      console.log('PLUGIN');
      // Pre-internal middleware here:
      server.middlewares.use(makeTrpcMiddleware());

      // Post internal middleware should be registered
      // in a returned thunk, e.g.:
      // () => server.middlewares.use(makeTrpcMiddleware());
      return;
    },
  };
}
