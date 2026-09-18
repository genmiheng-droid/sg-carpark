import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function serverlessApiPlugin(): Plugin {
  return {
    name: 'serverless-api-endpoints',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const pathname = url.split('?')[0];

        if (pathname === '/api/health' || pathname === '/api/health/') {
          try {
            const healthModule = await server.ssrLoadModule('./api/health.ts');
            return await healthModule.default(req, res);
          } catch (error) {
            console.error('API /api/health error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: String(error) }));
            return;
          }
        }

        if (pathname === '/api/carparkavailability' || pathname === '/api/carparkavailability/') {
          try {
            const carparkModule = await server.ssrLoadModule('./api/carparkavailability.ts');
            return await carparkModule.default(req, res);
          } catch (error) {
            console.error('API /api/carparkavailability error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: String(error) }));
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serverlessApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
