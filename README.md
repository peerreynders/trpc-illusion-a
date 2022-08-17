# trpc-illusion-a
The illusion of safety

[Notes are reverse (i.e. Stack/FIFO) order]
- Added the first chaos code `status429`. This already uncovered that the tRPC client code doesn't check the response for non-success status codes [ref](https://github.com/trpc/trpc/blob/5767007ef9a99df7a86aa6707ed82361590c416d/packages/client/src/internals/httpRequest.ts#L75-L89). The code doesn't fail until it tries to parse the non-JSON content. A proxy server could easily issue a "Too Many Requests" response.
- Zero effort merge into a minimal Solid TypeScript app ([Get Started](https://github.com/solidjs/templates#user-content-get-started)).
- Milestone: `randomnumber` subscription functional. [`ViteDevServer`](https://vitejs.dev/guide/api-javascript.html#vitedevserver)
- Milestone: `createPost` mutation functional.
- Milestone: Finally got the `hello` query working from the [standalone example](https://github.com/trpc/trpc/tree/main/examples/standalone-server) on Vite. Heavy references: [Using Plugins](https://vitejs.dev/guide/using-plugins.html#using-plugins), [Vite configure server hook](https://vitejs.dev/guide/api-plugin.html#vite-specific-hooks), [`proxy.ts`](https://github.com/vitejs/vite/blob/ae5639ccfa29c056fbb1a3ebb55070b65392168d/packages/vite/src/node/server/middlewares/proxy.ts)
- https://github.com/trpc/trpc/issues/2292 forced setting to ES2021 instead of ESNext
- Focusing on the [Plugin API](https://vitejs.dev/guide/api-plugin.html) for now though (specifically [configureServer](https://vitejs.dev/guide/api-plugin.html#vite-specific-hooks)).
- Interesting vite configuration option: [server.proxy](https://vitejs.dev/config/server-options.html#server-proxy)

---

```shell
$ npm run plugin:build

  > vite-template-solid@0.0.0 plugin:build
  > tsc --project tsconfig.server.json ; ./node_modules/.bin/rollup -c


  ./server/out/serveTrpcPlugin.js → ./server...
  created ./server in 704ms
$ npm run dev

  > vite-template-solid@0.0.0 dev
  > vite


    VITE v3.0.8  ready in 401 ms

    ➜  Local:   http://localhost:3000/
    ➜  Network: use --host to expose
```

---
 > The hard problems in distributed computing are not the problem of how to get things on and off the wire.
 
 
[A Note on Distributed Computing](https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf) (November 1994)

- [Programming Models and Languages for Distributed Computation](https://github.com/cmeiklejohn/PMLDC/blob/master/pmldc.pdf) (2016-10-18; [Christopher Meiklejohn ](https://christophermeiklejohn.com/))
  - [Promises: Linguistic Support for Efficient Asynchronous Procedure Calls in Distributed Systems ](https://heather.miller.am/teaching/cs7680/pdfs/liskov1988.pdf) (1988)
    - "Remote procedure calls have come to be the preferred method of communication in a distributed system because programs that use procedures are easier to understand and reason about than those that explicitly send and receive messages. However, remote calls require the caller to wait for a reply before continuing, and therefore can lead to lower performance than explicit message exchange. "
- [Christopher Meiklejohn, Caitie McCaffrey - A Brief History of Distributed Programming: RPC](https://www.youtube.com/watch?v=aDWZyYHj2XM) ([Slides](https://speakerdeck.com/caitiem20/a-brief-history-of-distributed-programming-rpc)) (November 2016)
  - [RFC 674: Procedure Call Protocol Documents](https://www.rfc-editor.org/rfc/rfc674.html) (1974)
  - [RFC 684: A Commentary on Procedure Calling as a Network Protocol](https://datatracker.ietf.org/doc/html/rfc684) (1975)
    - Local Calls and Remote Calls have different **Cost Profiles**
    - Remote calls can be delayed and never return
    - **Asychronous Message Passing** is a better model 
  - [RFC 707: A High-Level Framework for Network-Based Resource Sharing](https://datatracker.ietf.org/doc/html/rfc707) (1976)
    - **Generalization to functions**: Generalize TELNET and FTP's call-and-response model to functions from an application specific grammar. One port for all protocols.
    - **Control Flow Critique**: RPC only allows for sequential composition
  - [Implementing Remote Procedure Calls](https://web.eecs.umich.edu/~mosharaf/Readings/RPC.pdf) (1984)
  - [A Critique of the Remote Procedure Call Paradigm](https://www.cs.vu.nl/~ast/Publications/Papers/euteco-1988.pdf) (1988)
    - "It is our contention that a large number of things may now go wrong due to the fact that RPC tries to make remote procedure calls look exactly like local ones, but is unable to do it perfectly."
    - "There is, in fact, no protocol that guarantees that both sides definitely an unambiguously know that the RPC is over in the face of a lossy network."
    - [A Critique of the Remote Procedure Call Paradigm - 30 years later](https://blog.carlosgaldino.com/a-critique-of-the-remote-procedure-call-paradigm-30-years-later.html) (2016)
  - [RFC 1094: NFS: Network File System Protocol Specification](https://datatracker.ietf.org/doc/html/rfc1094) (1989)
    - **Soft Mounting**: Introduced new error coes for distributed failres that **existing UNIX applications could not handle**.
    - **Hard Mounting**: Operations would block until the could be completed successfully.
  - [CORBA: Common Object Request Broker Architecture](https://www.corba.org/) (1991)
    - Supported Cross-Language, Cross Address Space Interoperability for Object-Oriented Programming
    - Interface Definition Language (IDL): Used to generate stubs for remote objects & mappings between different primitive types
    - "It's just a Mapping Problem" Remote to local exception mapping, remote to local method invocation (not really possible).
      - [It's Just a Mapping Problem](https://steve.vinoski.net/pdf/IEEE-Just_A_Mapping_Problem.pdf) (2003; [Steve Vinoski](https://steve.vinoski.net/blog/))
  - [A Note on Distributed Computing](https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf) (November 1994): "The hard problems in distributed computing are not the problems of how to get things on and off the wire."
    - "It is the thesis of this note that this unified view of objects is mistaken."
    - **Latency**: performance analysis is non-trivial and one desing is not always going to be the right design.
    - **Memory Access**: How do we deal with the problems of pointers and references?
    - **Partial Failure**: Failures are detectable in local environment and result in "return of control". In distributed computing this isn't true.
    - "This approach would also defeat the overall purpose of unifying the object models. The real reason for attempting such a unification is to make distributed computing more like local computing and thus make distributed computing easier. This second approach to unifying the models makes local computing as complex as distributed computing."
  - Modern RPC Frameworks **Don't Provide a Unified Model**
  - "*The hard problems in distributed computing are not the problem of how to get things on and off the wire.*"
  - It doesn't solve the problem: "*What if it fails?*"
  - The point of RPC was to make remote calls just as simple as local calls.
  - If we treat everything as remote, have we simplified distributed computation at all?
  - If we can't treat all calls as local, is the *procedure call* the **right abstraction for distributed computation**?
  - [Lasp](https://github.com/lasp-lang) (2015): Distributed Deterministic Data Flow Programming in Erlang
  - [Consistency Analysis in Bloom: a CALM and Collected Approach](https://people.ucsc.edu/~palvaro/cidr11.pdf) (2011)
  - [Spores](https://docs.scala-lang.org/sips/spores.html) (2013): A Type-Based Foundation for Closures in the Age of Concurrecy and Distribution
    - Spores are small units of possibly mobile functional behaviour
    - Serializable closures with capture controlled by the type system (Scala)
    - Dual to Actor Systems (like Erlang). Actors exhange data with async messaging, spores are stateless processes that pass functions around with asynchronous messages.
    

- [RPC under fire](http://steve.vinoski.net/pdf/IEEE-RPC_Under_Fire.pdf) (2005)
- [Serendipitous Reuse/Demystifying RESTful Data Coupling](http://steve.vinoski.net/blog/2008/02/28/restful-data/) (2008-02-28)
- [Convenience Over Correctness](http://steve.vinoski.net/blog/2008/07/01/convenience-over-correctness/) (2008-07-01)
