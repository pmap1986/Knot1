/**
 * MIGRACIÓN · ¿La versión 2 del servicio dice lo mismo que la versión 1?
 *
 * El banco migró GET /api/cuentas a GET /api/v2/cuentas. Cambiaron los nombres de los campos:
 *   numero → id      tipo → producto      saldo → saldoDisponible
 * Una prueba de paridad pide las dos versiones con la misma sesión y las compara campo a campo.
 *
 * Resultado: ids y saldos coinciden; el producto de la cuenta Corriente NO.
 * Lo dejamos como hallazgo esperado (MIG-01): la prueba describe lo correcto, falla por el
 * defecto y la suite sigue en verde. Si algún día lo corrigen, Playwright avisa.
 */
import { Cuenta, CuentaV2 } from '../../src/api/ClienteBanco';
import { usuarios } from '../../src/datos/usuarios';
import { hallazgoEsperado } from '../../src/soporte/hallazgos';
import { test, expect } from '../../src/soporte/fixtures';

/** Traduce una cuenta de la versión 1 al formato de la versión 2. */
function comoV2(cuenta: Cuenta): CuentaV2 {
  return { id: cuenta.numero, producto: cuenta.tipo, saldoDisponible: cuenta.saldo };
}

test.describe('Paridad de cuentas v1 y v2', () => {
  let v1: Cuenta[];
  let v2: CuentaV2[];

  test.beforeEach(async ({ cliente }) => {
    await cliente.iniciarSesion(usuarios.ana);
    v1 = (await cliente.cuentas()).datos;
    const respuestaV2 = await cliente.cuentasV2();
    expect(respuestaV2.estado).toBe(200);
    v2 = respuestaV2.datos.cuentas;
  });

  test('las dos versiones tienen las mismas cuentas', () => {
    expect(v2.map((c) => c.id)).toEqual(v1.map((c) => c.numero));
  });

  test('los saldos coinciden', () => {
    expect(v2.map((c) => c.saldoDisponible)).toEqual(v1.map((c) => c.saldo));
  });

  test('cada cuenta conserva su producto', () => {
    hallazgoEsperado('MIG-01', 'en /api/v2/cuentas la cuenta Corriente aparece como "Ahorros"');

    expect(v2).toEqual(v1.map(comoV2));
  });
});
