import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      outputDir: 'dist',
      entryRoot: 'src/index.ts',
      skipDiagnostics: false,
      logDiagnostics: true,
    }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'draggable',
      formats: ['es'],
      fileName: () => 'index.js',
    },
  },
  optimizeDeps: {
    exclude: ['./src/test-utils/**/*'],
  },
});
