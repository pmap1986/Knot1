/**
 * RETO 3 (S3) · PaginaTransferir.transferir.
 * Entra con la sesión ya abierta (abrirConSesion): estas pruebas son de transferencias, no de login.
 * Cuando completes el reto, la última prueba encuentra un bug real del banco.
 */
import { abrirConSesion } from '../../src/flujos/sesion';
import { cuentas } from '../../src/datos/usuarios';
import { hallazgoEsperado } from '../../src/soporte/hallazgos';
import { test, expect } from '../../src/soporte/fixtures';

test.beforeEach(async ({ page, cliente, paginaTransferir }) => {
  await abrirConSesion(page, cliente);
  await paginaTransferir.abrir();
});

test('una transferencia válida desde Ahorros entrega comprobante', async ({ paginaTransferir }) => {
  await paginaTransferir.transferir({ destino: cuentas.destino, monto: 100_000 });

  expect(await paginaTransferir.esperarResultado()).toContain('Transferencia exitosa');
  await expect(paginaTransferir.comprobante).toContainText('4x1000: $400');
});

test('también transfiere desde la cuenta Corriente', async ({ paginaTransferir }) => {
  await paginaTransferir.transferir({ origen: cuentas.corriente.numero, destino: cuentas.destino, monto: 50_000 });

  expect(await paginaTransferir.esperarResultado()).toContain('Transferencia exitosa');
});

test('sin aceptar el 4x1000 no deja transferir', async ({ paginaTransferir }) => {
  await paginaTransferir.transferir({ destino: cuentas.destino, monto: 50_000, aceptar4x1000: false });

  await expect(paginaTransferir.mensajeDeError).toHaveText('Debes aceptar el cobro del 4x1000');
});

test('acepta el monto mínimo exacto de $1.000', async ({ paginaTransferir }) => {
  hallazgoEsperado('BUG-01', 'el monto exacto de $1.000 se rechaza aunque es el mínimo permitido');

  await paginaTransferir.transferir({ destino: cuentas.destino, monto: 1_000 });

  expect(await paginaTransferir.esperarResultado()).toContain('Transferencia exitosa');
});
