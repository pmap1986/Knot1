/**
 * RETO 4 (S3) · ClienteBanco.transferir — la capa de API.
 * Cuando completes el reto, la última prueba encuentra un bug real del banco.
 */
import { cuentas, usuarios } from '../../src/datos/usuarios';
import { hallazgoEsperado } from '../../src/soporte/hallazgos';
import { test, expect } from '../../src/soporte/fixtures';

test.beforeEach(async ({ cliente }) => {
  await cliente.iniciarSesion(usuarios.ana);
});

test('transferir 100.000 desde Ahorros cobra 400 de 4x1000', async ({ cliente }) => {
  const { estado, datos } = await cliente.transferir(cuentas.ahorros.numero, cuentas.destino, 100_000);

  expect(estado).toBe(201);
  expect(datos).toMatchObject({ monto: 100_000, gmf: 400, total: 100_400, saldo: cuentas.ahorros.saldoInicial - 100_400 });
});

test('un destino de 9 dígitos responde 400 con el motivo', async ({ cliente }) => {
  const { estado, datos } = await cliente.transferir(cuentas.ahorros.numero, '123456789', 50_000);

  expect(estado).toBe(400);
  expect(datos.error).toBe('La cuenta destino debe tener 10 dígitos');
});

test('desde Corriente también descuenta el 4x1000 del saldo', async ({ cliente }) => {
  hallazgoEsperado('BUG-02', 'desde la cuenta Corriente el 4x1000 se cobra pero no se descuenta del saldo');

  const { datos } = await cliente.transferir(cuentas.corriente.numero, cuentas.destino, 100_000);

  expect(datos.saldo).toBe(cuentas.corriente.saldoInicial - 100_400);
});
