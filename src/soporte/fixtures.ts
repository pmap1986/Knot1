/**
 * FIXTURES: le entregan a cada prueba las piezas ya armadas.
 *
 * En lugar de escribir "new PaginaLogin(page)" en cada prueba, la prueba las pide por nombre:
 *   test('...', async ({ paginaLogin, cliente }) => { ... })
 *
 * La prueba no sabe CÓMO se crean sus piezas, solo las usa. Esa idea se llama
 * "inversión de dependencias" (la D de SOLID) y la trabajamos en la S4.
 */
import { test as base } from '@playwright/test';
import { ClienteBanco } from '../api/ClienteBanco';
import { PaginasDeIngreso } from '../flujos/sesion';
import { PaginaBuzon } from '../paginas/PaginaBuzon';
import { PaginaInicio } from '../paginas/PaginaInicio';
import { PaginaLogin } from '../paginas/PaginaLogin';
import { PaginaOtp } from '../paginas/PaginaOtp';
import { PaginaTransferir } from '../paginas/PaginaTransferir';

interface Piezas {
  cliente: ClienteBanco;
  paginaLogin: PaginaLogin;
  paginaOtp: PaginaOtp;
  paginaInicio: PaginaInicio;
  paginaTransferir: PaginaTransferir;
  /** El buzón se abre en su propia pestaña, como en la vida real. */
  paginaBuzon: PaginaBuzon;
  /** Todas las pantallas del ingreso juntas, para flujos/sesion.ts */
  paginas: PaginasDeIngreso;
}

export const test = base.extend<Piezas>({
  cliente: async ({ request }, usar) => {
    await usar(new ClienteBanco(request));
  },
  paginaLogin: async ({ page }, usar) => {
    await usar(new PaginaLogin(page));
  },
  paginaOtp: async ({ page }, usar) => {
    await usar(new PaginaOtp(page));
  },
  paginaInicio: async ({ page }, usar) => {
    await usar(new PaginaInicio(page));
  },
  paginaTransferir: async ({ page }, usar) => {
    await usar(new PaginaTransferir(page));
  },
  paginaBuzon: async ({ context }, usar) => {
    const pestana = await context.newPage();
    await usar(new PaginaBuzon(pestana));
    await pestana.close();
  },
  paginas: async ({ paginaLogin, paginaOtp, paginaBuzon, paginaInicio }, usar) => {
    await usar({ login: paginaLogin, otp: paginaOtp, buzon: paginaBuzon, inicio: paginaInicio });
  },
});

export { expect } from '@playwright/test';
