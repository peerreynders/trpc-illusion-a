import url from 'url';
import ws from 'ws';
import { nodeHTTPRequestHandler } from '@trpc/server/adapters/node-http';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appPathname, appRouter, createContext } from './app-router';

import type stream from 'node:stream';
import type http from 'node:http';
import type { Server, WebSocket } from 'ws';
import type { Connect } from 'vite/types/connect';
import type { AppRouter } from './app-router';

function makeUpgradeListener(wss: Server) {
  function upgrade(ws: WebSocket) {
    wss.emit('connection', ws);
  }

  function upgradeListener(
    request: http.IncomingMessage,
    socket: stream.Duplex,
    head: Buffer
  ) {
    if (!request.url) return;

    const pathname = url.parse(request.url).pathname;
    if (pathname === appPathname) {
      wss.handleUpgrade(request, socket, head, upgrade);
    }
  }

  return upgradeListener;
}

function makeTrpcMiddleware(server: http.Server | null) {
  const options = {
    router: appRouter,
    createContext,
  };

  if (server) {
    // WebSockets
    //
    const wss = new ws.Server({ noServer: true });

    const wssOptions = {
      ...options,
      wss,
    };
    applyWSSHandler<AppRouter>(wssOptions);

    server.on('upgrade', makeUpgradeListener(wss));
  }

  // HTTP Request/Response
  //
  // `+ 1` to exclude the leading solidus
  const startAt = appPathname.length + 1;

  return async function trpcMiddleware(
    request: Connect.IncomingMessage,
    response: http.ServerResponse,
    next: Connect.NextFunction
  ) {
    if (!(request.url && request.url.startsWith(appPathname))) return next();

    const pathname = url.parse(request.url).pathname;
    if (!pathname) return next();

    const endpoint = pathname.substring(startAt);
    await nodeHTTPRequestHandler<
      AppRouter,
      Connect.IncomingMessage,
      http.ServerResponse
    >({
      ...options,
      req: request,
      res: response,
      path: endpoint,
    });
  };
}

export { makeTrpcMiddleware };
