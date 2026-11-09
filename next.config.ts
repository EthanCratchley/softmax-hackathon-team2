import type { NextConfig } from 'next';

// `output: 'standalone'` is required by `npx piezas deploy`.
const config: NextConfig = {
  output: 'standalone',
  distDir: process.env.KESTREL_PREVIEW_INSTANCE === '1' ? '.next-preview' : '.next',
};

export default config;
