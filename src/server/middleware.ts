import url from 'url';
import { nodeHTTPRequestHandler } from '@trpc/server/adapters/node-http';
import { appRouter } from './app-router';

import type { AnyRouter } from '@trpc/server';
import type http from 'node:http';
import type { Connect } from 'vite/types/connect';

function makeTrpcMiddleware() {
  const options = {
    router: appRouter,
    createContext() {
      return {};
    }
  };

  const rootComponent = '/trpc';
  // `+ 1` to exclude the leading solidus
  const startAt = rootComponent.length + 1;

  return async function trpcMiddleware(
    req: Connect.IncomingMessage,
    res: http.ServerResponse,
    next: Connect.NextFunction
  ) {
    if (!(req.url && req.url.startsWith(rootComponent))) return next();

    const pathname = url.parse(req.url).pathname;
    if (!pathname) return next();

    const endpoint = pathname.substring(startAt);
    await nodeHTTPRequestHandler({
      ...options,
      req,
      res,
      path: endpoint,
    });
  };
}

export {
  makeTrpcMiddleware
};
