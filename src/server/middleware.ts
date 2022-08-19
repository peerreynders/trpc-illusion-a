import ws from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appOptions, appPathname, checkAppName, makeAppHandler } from './app-handler';
import { checkChaos, chaosHandler } from './chaos';
import { hasOwn } from './helpers';

import type stream from 'node:stream';
import type http from 'node:http';
import type { Server, WebSocket } from 'ws';
import type { Connect } from 'vite/types/connect';
import type { AppRouter } from './app-bridge';

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
  const options = appOptions();
  const appHandler = makeAppHandler(options);

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

  return async function trpcMiddleware(
    request: Connect.IncomingMessage,
    response: http.ServerResponse,
    next: Connect.NextFunction
  ) {
    const url = urlFromRequest(request);
    if (!url) return next();

    const appName = checkAppName(url);
    if (!appName) return next();

    const kind = checkChaos(url);
    if (kind) return chaosHandler({ kind, appHandler, appName }, request, response);

    await appHandler(request, response, appName);
  };
}

export { makeTrpcMiddleware };
