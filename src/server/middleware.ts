import ws from 'ws';
import { nodeHTTPRequestHandler } from '@trpc/server/adapters/node-http';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appRouter, createContext } from './app-router';
import { appPathname } from './app-bridge';
import { checkChaos, chaosHandler } from './chaos';

import type stream from 'node:stream';
import type http from 'node:http';
import type { Server, WebSocket } from 'ws';
import type { Connect } from 'vite/types/connect';
import type { AppRouter } from './app-bridge';

const hasOwnProperty = Object.hasOwnProperty;

function hasOwn(object: unknown, key: string): boolean {
  if (!(object && typeof object === 'object')) return false;
  return hasOwnProperty.call(object, key);
}

function urlFromRequest({ socket, headers, url }: http.IncomingMessage) {
  const host = headers.host;
  if (!host) return undefined;

  const protocol = hasOwn(socket, 'encrypted') ? 'https://' : 'http://';
  return new URL(protocol + host + url);
}

function makeUpgradeListener(wss: Server) {
  function upgrade(ws: WebSocket) {
    wss.emit('connection', ws);
  }

  function upgradeListener(
    request: http.IncomingMessage,
    socket: stream.Duplex,
    head: Buffer
  ) {
    const url = urlFromRequest(request);
    if (!url) return;

    if (url.pathname === appPathname) {
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
    const url = urlFromRequest(request);
    const pathname = url?.pathname;

    if (!(url && pathname && pathname.startsWith(appPathname))) return next();

    const kind = checkChaos(url);
    if (kind) return chaosHandler(kind, request, response);

    await forward(request, response,  pathname.substring(startAt));
  };

  function forward(
    req: Connect.IncomingMessage, 
    res: http.ServerResponse,
    path: string
  ) {
    return nodeHTTPRequestHandler<
      AppRouter,
      Connect.IncomingMessage,
      http.ServerResponse
    >({
      ...options,
      req,
      res,
      path
    });
  }
}

export { makeTrpcMiddleware };
