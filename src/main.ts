import { createWSClient, wsLink } from '@trpc/client/links/wsLink';
import { httpLink } from '@trpc/client/links/httpLink';
import { splitLink } from '@trpc/client/links/splitLink';
import { createTRPCClient } from '@trpc/client';
import { appPathname } from './server/app-bridge';

import type { Operation } from '@trpc/client';
import type { AppRouter } from './server/app-bridge';

const [urlBase, urlWs] = (() => {
  const url = new URL(window.location.origin);
  url.pathname = appPathname;
  const base = url.href;
  url.protocol = 'ws:';
  const ws = url.href;
  return [base, ws];
})();

async function main() {
  // WebSocket Client
  const wsClient = createWSClient({
    url: urlWs,
  });

  const linkOptions = {
    condition(op: Operation) {
      return op.type === 'subscription';
    },
    true: wsLink({
      client: wsClient,
    }),
    false: httpLink({
      url: urlBase,
    }),
  };

  const clientOptions = {
    links: [splitLink(linkOptions)],
  };
  const client = createTRPCClient<AppRouter>(clientOptions);

  // query
  //
  const queryParams = {
    name: 'world',
  };
//  const helloRes = await client.query('hello', queryParams);
  const helloRes = await client.query('hello', { name: 'status429' });

  console.log('helloResponse', helloRes);

  // mutation
  //
  const mutationParams = {
    title: 'hello world',
    text: 'check out tRPC.io',
  };
  const createPostRes = await client.mutation('createPost', mutationParams);

  console.log('createPostResponse', createPostRes);

  // subscription
  //
  let count = 0;
  const unsub = client.subscription('randomnumber', null, {
    onNext(data) {
      // ^ note that `data` here is inferred
      console.log('received', data);
      count++;
      if (count > 3) {
        // stop after 3 pulls
        unsub();
      }
    },
    onError(err) {
      console.error('error', err);
    },
    onDone() {
      console.log('done called - closing websocket');
      wsClient.close();
    },
  });
}

export {
  main
};
