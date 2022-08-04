import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import serveTrpcPlugin from './server/serveTrpcPlugin';

export default defineConfig({
  plugins: [solidPlugin(), serveTrpcPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
