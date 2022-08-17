import { appPathname } from './app-bridge';

import type { IncomingMessage, ServerResponse } from 'node:http';

const chaosPathname = `${appPathname}/hello`;

const chaosKindValues = [
  'status429'
] as const;

type ChaosKind = (typeof chaosKindValues)[number];

const chaosKinds = new Set<string>(chaosKindValues);

function isChaosKind(name: string): name is ChaosKind {
  return chaosKinds.has(name);
}

function serveTooManyRequests(_req: IncomingMessage, res: ServerResponse) {
  res.writeHead(429, { 'Content-Type': 'text/plain' });
  res.end('Too Many Requests' , 'utf8');
}

function extractName(params: URLSearchParams) {
  const input = params.get('input');
  if (typeof input !== 'string') return undefined;

  try {
    const payload = JSON.parse(input);
    return payload.name;

  } catch (_e) {
    return undefined;
  }
}

function checkChaos(url: URL): ChaosKind | undefined {
  if (url.pathname !== chaosPathname) return undefined;

  const kind = extractName(url.searchParams);
  return isChaosKind(kind) ? kind : undefined;
}

function chaosHandler(kind: ChaosKind, req: IncomingMessage, res: ServerResponse) {
   switch(kind) {
     case 'status429':
	return serveTooManyRequests(req, res);
   }
}

export {
  chaosHandler,
  checkChaos
};
