import { router, Subscription } from '@trpc/server';
import { z } from 'zod';

import type { SubscriptionEmit } from '@trpc/server';

type Context = {};

function createContext(): Context {
  return {};
}

// query
//
const queryInput = z.object({ name: z.string().nullish() }).nullish();
type QueryInput = z.infer<typeof queryInput>;

const queryParams = {
  input: queryInput,
  resolve({ input }: { input: QueryInput }) {
    return {
      text: `hello ${input?.name ?? 'world'}`,
    };
  },
};

// mutation
//
const mutationInput = z.object({ title: z.string(), text: z.string() });
type MutationInput = z.infer<typeof mutationInput>;

const mutationParams = {
  input: mutationInput,
  resolve({ input }: { input: MutationInput }) {
    // imagine db call here
    return {
      id: String(
        Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)
      ),
      ...input,
    };
  },
};

// subscription
//
type SubscriptionOutput = {
  randomNumber: number;
};

function startEmitting(emit: SubscriptionEmit<SubscriptionOutput>): () => void {
  const timer = setInterval(() => {
    // emits a number every second
    emit.data({ randomNumber: Math.random() });
  }, 200);

  return () => {
    clearInterval(timer);
  };
}

const subscriptionParams = {
  resolve() {
    return new Subscription<SubscriptionOutput>(startEmitting);
  },
};

// router
//
const appRouter = router<Context>()
  .query('hello', queryParams)
  .mutation('createPost', mutationParams)
  .subscription('randomnumber', subscriptionParams);

export type AppRouter = typeof appRouter;

export { appRouter, createContext };
