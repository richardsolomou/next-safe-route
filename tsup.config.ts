import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  dts: true,
  sourcemap: true,
  format: ['cjs', 'esm'],
  minify: !options.watch,
}));
