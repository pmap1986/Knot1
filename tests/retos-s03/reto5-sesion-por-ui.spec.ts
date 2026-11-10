/**
 * RETO 5 (S3) · iniciarSesionPorUi — una capa de flujos que combina pantallas.
 * Necesita los retos 1 y 2 resueltos.
 */
import { iniciarSesionPorUi } from '../../src/flujos/sesion';
import { usuarios } from '../../src/datos/usuarios';
import { test, expect } from '../../src/soporte/fixtures';

test('ingresa por la pantalla y ve sus saldos', async ({ paginas, paginaInicio }) => {
  await iniciarSesionPorUi(paginas, usuarios.ana);

  await expect(paginaInicio.nombreDelCliente).toHaveText('Ana Pérez');
  expect(await paginaInicio.saldoDe('Ahorros')).toBe('$1.500.000');
});

test('funciona igual con otro usuario', async ({ paginas, paginaInicio }) => {
  await iniciarSesionPorUi(paginas, usuarios.luis);

  await expect(paginaInicio.nombreDelCliente).toHaveText('Luis Gómez');
});
