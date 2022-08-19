import { nodeHTTPRequestHandler } from '@trpc/server/adapters/node-http';
import { appRouter, createContext } from './app-router';
import { appPathname } from './app-bridge';

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AppRouter } from './app-bridge';

// `+ 1` to exclude the leading solidus
const startAt = appPathname.length + 1;

function checkAppName(url: URL) : (string | undefined) {
  if (!(url.pathname && url.pathname.startsWith(appPathname))) 
    return undefined;

  return url.pathname.substring(startAt);
}

function appOptions() {
  return {
    router: appRouter,
    createContext
  };
}

type AppOptions = ReturnType<typeof appOptions>;

function makeAppHandler(options: AppOptions) {
  return function appHandler(
    req: IncomingMessage, 
    res: ServerResponse,
    appName: string
  ) {
    return nodeHTTPRequestHandler<
      AppRouter,
      IncomingMessage,
      ServerResponse
    >({
      ...options,
      req,
      res,
      path: appName
    });
  };
}

export type AppHandler = ReturnType<typeof makeAppHandler>;

export {
  appOptions,
  appPathname,
  checkAppName,
  makeAppHandler
};
