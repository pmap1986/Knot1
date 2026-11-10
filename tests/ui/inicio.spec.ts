/**
 * Pruebas de UI que usan las capas.
 * Compara con tests/antes/espagueti.spec.ts: aquí no hay ni un localizador.
 * Las piezas (paginaInicio, cliente) llegan por los fixtures de src/soporte/fixtures.ts.
 */
import { abrirConSesion } from '../../src/flujos/sesion';
import { usuarios } from '../../src/datos/usuarios';
import { test, expect } from '../../src/soporte/fixtures';

test.describe('Mis cuentas', () => {
  test.beforeEach(async ({ page, cliente, paginaInicio }) => {
    await abrirConSesion(page, cliente, usuarios.ana);
    await paginaInicio.abrir();
  });

  test('muestra el nombre del cliente', async ({ paginaInicio }) => {
    await expect(paginaInicio.titulo).toBeVisible();
    await expect(paginaInicio.nombreDelCliente).toHaveText(usuarios.ana.nombre);
  });

  test('muestra el saldo inicial de Ahorros', async ({ paginaInicio }) => {
    expect(await paginaInicio.saldoDe('Ahorros')).toBe('$1.500.000');
  });

  test('muestra el saldo inicial de Corriente', async ({ paginaInicio }) => {
    expect(await paginaInicio.saldoDe('Corriente')).toBe('$250.000');
  });
});
