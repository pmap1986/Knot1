/**
 * RETO 1 (S3) · PaginaLogin.ingresar — encapsulamiento.
 * Mientras el reto esté pendiente, estas pruebas fallan con el mensaje PENDIENTE.
 * Corre solo este reto:  npx playwright test reto1 --project=retos-s03
 */
import { usuarios } from '../../src/datos/usuarios';
import { test, expect } from '../../src/soporte/fixtures';

test.beforeEach(async ({ paginaLogin }) => {
  await paginaLogin.abrir();
});

test('con datos correctos llega a la pantalla del código', async ({ paginaLogin, paginaOtp }) => {
  await paginaLogin.ingresar(usuarios.ana.usuario, usuarios.ana.clave);

  await expect(paginaOtp.titulo).toBeVisible();
});

test('con clave errada muestra el error', async ({ paginaLogin }) => {
  await paginaLogin.ingresar(usuarios.conClaveErrada.usuario, usuarios.conClaveErrada.clave);

  await expect(paginaLogin.mensajeDeError).toHaveText('Usuario o clave incorrectos');
});
