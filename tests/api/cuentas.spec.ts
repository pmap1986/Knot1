/**
 * Pruebas de API de las cuentas. Fíjate: ninguna prueba toca el token.
 * ClienteBanco lo guarda y lo envía solo (encapsulamiento).
 */
import { cuentas, usuarios } from '../../src/datos/usuarios';
import { test, expect } from '../../src/soporte/fixtures';

test('sin sesión, las cuentas responden 401', async ({ cliente }) => {
  const { estado } = await cliente.cuentas();

  expect(estado).toBe(401);
});

test('con sesión, entrega las dos cuentas con su saldo inicial', async ({ cliente }) => {
  await cliente.iniciarSesion(usuarios.ana);

  const { estado, datos } = await cliente.cuentas();

  expect(estado).toBe(200);
  expect(datos).toEqual([
    { numero: cuentas.ahorros.numero, tipo: 'Ahorros', saldo: cuentas.ahorros.saldoInicial },
    { numero: cuentas.corriente.numero, tipo: 'Corriente', saldo: cuentas.corriente.saldoInicial },
  ]);
});
