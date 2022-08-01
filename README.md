# trpc-illusion-a
The illusion of safety

[Notes are reverse (i.e. Stack/FIFO) order]
- Milestone: Finally got the `hello` query working from the [standalone example](https://github.com/trpc/trpc/tree/main/examples/standalone-server) on Vite. Heavy references: [Using Plugins](https://vitejs.dev/guide/using-plugins.html#using-plugins), [Vite configure server hook](https://vitejs.dev/guide/api-plugin.html#vite-specific-hooks), [`proxy.ts`](https://github.com/vitejs/vite/blob/ae5639ccfa29c056fbb1a3ebb55070b65392168d/packages/vite/src/node/server/middlewares/proxy.ts)
- https://github.com/trpc/trpc/issues/2292 forced setting to ES2021 instead of ESNext
- Focusing on the [Plugin API](https://vitejs.dev/guide/api-plugin.html) for now though (specifically [configureServer](https://vitejs.dev/guide/api-plugin.html#vite-specific-hooks)).
- Interesting vite configuration option: [server.proxy](https://vitejs.dev/config/server-options.html#server-proxy)
 
