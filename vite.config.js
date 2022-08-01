import { defineConfig } from 'vite';
import serveTrpcPlugin from './server/serveTrpcPlugin';

export default defineConfig({
  plugins: [serveTrpcPlugin()],
});
