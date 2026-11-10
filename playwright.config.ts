import { defineConfig, devices } from '@playwright/test';
import { entorno } from './src/config/entorno';

/**
 * Configuración de Playwright. Cada carpeta de tests/ es un "proyecto":
 *   npx playwright test --project=ui
 */

// Lo que comparten las pruebas que abren navegador.
const conNavegador = {
  ...devices['Desktop Chrome'],
  baseURL: entorno.urlBase,
  // En equipos que no dejan descargar Chromium: PW_CHANNEL=msedge usa el Edge instalado.
  channel: process.env.PW_CHANNEL,
  screenshot: 'on' as const,
  trace: 'retain-on-failure' as const,
};

// Las pruebas de unidad no necesitan el banco: si solo corres ese proyecto, no se inicia.
const soloUnidad = process.argv.includes('--project=unidad') && !process.argv.some((a) => a.startsWith('--project=') && a !== '--project=unidad');

export default defineConfig({
  // Uno a la vez: varias pruebas leen el mismo buzón de SMS y así no se cruzan los códigos.
  workers: 1,
  // Una prueba en rojo es un hallazgo o un error de la prueba: no se reintenta.
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'resultados.json' }]],

  // Banco Demo: se inicia solo y no necesita internet.
  webServer: soloUnidad
    ? undefined
    : {
        command: 'node banco-demo/server.js',
        url: `${entorno.urlBase}/api/salud`,
        reuseExistingServer: true,
        timeout: 60_000,
      },

  projects: [
    // S3 · Así se escribe al empezar: todo dentro de la prueba.
    { name: 'antes', testDir: 'tests/antes', use: conNavegador },
    // Pruebas que usan las capas.
    { name: 'ui', testDir: 'tests/ui', use: conNavegador },
    { name: 'api', testDir: 'tests/api', use: { baseURL: entorno.urlBase } },
    { name: 'migracion', testDir: 'tests/migracion', use: { baseURL: entorno.urlBase } },
    // S3 · Retos de clases y capas.
    { name: 'retos-s03', testDir: 'tests/retos-s03', use: conNavegador },
    // S4 · Retos de SOLID: pruebas de unidad, sin navegador y sin servidor.
    { name: 'unidad', testDir: 'tests/retos-s04' },
  ],
});
