import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

/**
 * Lightweight Vite WebSocket State Relay Plugin.
 * Reuses Vite's built-in WebSocket server (`server.ws`) so that multiple tabs,
 * macOS Safari Private Browsing windows, and other devices on the same LAN
 * stay synchronized in real time with zero external dependencies.
 */
function rcUiTunerSyncPlugin(): Plugin {
  // Sync registry v2 (clears stale pre-v2 panel maps upon config reload)
  const stateRegistry = new Map<string, unknown>();

  return {
    name: 'rc-ui-tuner-ws-sync',
    configureServer(server) {
      server.ws.on(
        'rc-ui-tuner:sync-patch',
        (data: { senderId?: string; entries?: Record<string, unknown>; ts?: number }) => {
          if (!data || !data.entries || typeof data.entries !== 'object') return;
          for (const [key, value] of Object.entries(data.entries)) {
            if (key === 'store:menuLayout' || key === 'store:floating') continue;
            stateRegistry.set(key, value);
          }
          server.ws.send('rc-ui-tuner:sync-patch', data);
        }
      );

      server.ws.on(
        'rc-ui-tuner:sync-seed',
        (data: { senderId?: string; entries?: Record<string, unknown> }) => {
          if (!data || !data.entries || typeof data.entries !== 'object') return;
          const newlySeeded: Record<string, unknown> = {};
          let hasNew = false;
          for (const [key, value] of Object.entries(data.entries)) {
            if (!stateRegistry.has(key)) {
              stateRegistry.set(key, value);
              newlySeeded[key] = value;
              hasNew = true;
            }
          }
          if (hasNew) {
            server.ws.send('rc-ui-tuner:sync-patch', {
              senderId: data.senderId,
              entries: newlySeeded,
              ts: Date.now(),
            });
          }
        }
      );

      server.ws.on(
        'rc-ui-tuner:sync-request',
        (data: { senderId?: string }, client) => {
          const entries = Object.fromEntries(stateRegistry.entries());
          client.send('rc-ui-tuner:sync-snapshot', {
            targetId: data?.senderId,
            entries,
            ts: Date.now(),
          });
        }
      );

      server.ws.on(
        'rc-ui-tuner:sync-reset',
        (data: { senderId?: string; scopePrefix?: string; ts?: number }) => {
          if (data?.scopePrefix) {
            for (const key of Array.from(stateRegistry.keys())) {
              if (key.startsWith(data.scopePrefix)) {
                stateRegistry.delete(key);
              }
            }
          } else {
            stateRegistry.clear();
          }
          server.ws.send('rc-ui-tuner:sync-reset', {
            senderId: data?.senderId,
            scopePrefix: data?.scopePrefix,
            ts: Date.now(),
          });
        }
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), rcUiTunerSyncPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    target: 'esnext'
  }
});

