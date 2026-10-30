// Движок в отдельном потоке: на пути WASM без видеокарты тайл считается секундами, в главном потоке
// страница замирала и «Cancel» не нажимался (замер 30.10: 0.75 МП = 230 с на 2 ядрах сервера).
import { enhance, getSession } from './engine.js';
import * as engine from './engine.js';

let cancelled = false;

self.onmessage = async ({ data }) => {
  if (data.type === 'cancel') { cancelled = true; return; }
  if (data.type === 'warm') {
    getSession((d, t) => self.postMessage({ type: 'download', d, t })).catch(() => {});
    return;
  }
  if (data.type === 'run') {
    cancelled = false;
    try {
      const blob = await enhance(data.bitmap, data.mode, data.quality, {
        onDownload: (d, t) => self.postMessage({ type: 'download', d, t }),
        onProgress: (d, t) => self.postMessage({ type: 'progress', d, t, backend: engine.backend }),
        isCancelled: () => cancelled,
      });
      self.postMessage({ type: 'done', blob, backend: engine.backend });
    } catch (err) {
      self.postMessage({ type: 'error', message: String(err?.message || err) });
    }
  }
};
