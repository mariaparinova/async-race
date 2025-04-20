import { defineConfig, UserConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const config: UserConfig = {
    build: {
      target: 'es2022',
    },
  };

  if (mode === 'production') {
    config.base = './'
  }

  return config;
});
