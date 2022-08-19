import { appPathname } from './app-handler';
import { hasOwn } from './helpers';

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AppHandler } from './app-handler';

const chaosPathname = `${appPathname}/hello`;

function handleSlowResponse(
  { appHandler, appName }: ChaosDetails,
  req: IncomingMessage,
  res: ServerResponse
) {
  const task = () => appHandler(req, res, appName);
  setTimeout(task, 60000);
}

function handleText(
  statusCode: number,
  description: string,
  res: ServerResponse
) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
  res.end(description, 'utf8');
}

const chaosHandlers = {
  slow: handleSlowResponse,
  status429: (
    _details: ChaosDetails,
    _req: IncomingMessage,
    res: ServerResponse
  ) => handleText(429, 'Too Many Requests', res),
  status500: (
    _details: ChaosDetails,
    _req: IncomingMessage,
    res: ServerResponse
  ) => handleText(500, 'Internal Server Error', res),
  status502: (
    _details: ChaosDetails,
    _req: IncomingMessage,
    res: ServerResponse
  ) => handleText(502, 'Bad Gateway', res),
  status503: (
    _details: ChaosDetails,
    _req: IncomingMessage,
    res: ServerResponse
  ) => handleText(503, 'Service Unavailable', res),
  status504: (
    _details: ChaosDetails,
    _req: IncomingMessage,
    res: ServerResponse
  ) => handleText(504, 'Gateway Timeout', res),
} as const;

type ChaosKind = keyof typeof chaosHandlers;

export type ChaosDetails = {
  kind: ChaosKind;
  appName: string;
  appHandler: AppHandler;
};

function isChaosKind(name: string): name is ChaosKind {
  return hasOwn(chaosHandlers, name);
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

function chaosHandler(
  details: ChaosDetails,
  req: IncomingMessage,
  res: ServerResponse
) {
  chaosHandlers[details.kind](details, req, res);
}

export { checkChaos, chaosHandler };
