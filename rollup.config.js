import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './server/out/serveTrpcPlugin.js',
  output: {
    dir: './server',
    format: 'esm',
  },
  plugins: [
    nodeResolve(),
    commonjs()
  ]
};
