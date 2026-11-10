/**
 * ANTES · Así se escriben las pruebas al empezar (y está bien empezar así).
 *
 * Las 5 pruebas pasan. El problema aparece cuando la aplicación cambia:
 *   - Cuenta cuántas veces aparece getByLabel('Usuario') o 'Clave123'.
 *   - Si el botón "Ingresar" pasa a llamarse "Entrar", ¿cuántas líneas hay que corregir?
 *   - Para ver un saldo hay que repetir todo el ingreso, con buzón incluido.
 *
 * En la S3 separamos esto en capas (src/). Compara con tests/ui y tests/api.
 */
import { test, expect } from '@playwright/test';

test('ingreso con datos correctos pide el código', async ({ page }) => {
  await page.goto('http://127.0.0.1:4000/');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Clave').fill('Clave123');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).toHaveURL(/\/otp$/);
});

test('ingreso con clave errada muestra el error', async ({ page }) => {
  await page.goto('http://127.0.0.1:4000/');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Clave').fill('otra');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page.getByRole('alert')).toHaveText('Usuario o clave incorrectos');
});

test('ingreso completo leyendo el código en el buzón', async ({ page, context }) => {
  await page.goto('http://127.0.0.1:4000/');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Clave').fill('Clave123');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/otp$/);

  const buzon = await context.newPage();
  await buzon.goto('http://127.0.0.1:4000/buzon');
  await buzon.getByLabel('Usuario').fill('ana');
  await buzon.getByRole('button', { name: 'Buscar' }).click();
  const texto = await buzon.getByRole('cell', { name: /código de seguridad/ }).first().innerText();
  const codigo = texto.match(/\d{6}/)![0];

  await page.getByLabel('Código de seguridad').fill(codigo);
  await page.getByRole('button', { name: 'Validar' }).click();

  await expect(page.getByRole('heading', { name: 'Mis cuentas' })).toBeVisible();
});

test('después de ingresar ve el saldo de Ahorros', async ({ page, context }) => {
  await page.goto('http://127.0.0.1:4000/');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Clave').fill('Clave123');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/otp$/);

  const buzon = await context.newPage();
  await buzon.goto('http://127.0.0.1:4000/buzon');
  await buzon.getByLabel('Usuario').fill('ana');
  await buzon.getByRole('button', { name: 'Buscar' }).click();
  const texto = await buzon.getByRole('cell', { name: /código de seguridad/ }).first().innerText();
  const codigo = texto.match(/\d{6}/)![0];

  await page.getByLabel('Código de seguridad').fill(codigo);
  await page.getByRole('button', { name: 'Validar' }).click();

  await expect(page.getByRole('row').filter({ hasText: 'Ahorros' })).toContainText('$1.500.000');
});

test('transferencia válida desde Ahorros entrega comprobante', async ({ page, context }) => {
  await page.goto('http://127.0.0.1:4000/');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Clave').fill('Clave123');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/otp$/);

  const buzon = await context.newPage();
  await buzon.goto('http://127.0.0.1:4000/buzon');
  await buzon.getByLabel('Usuario').fill('ana');
  await buzon.getByRole('button', { name: 'Buscar' }).click();
  const texto = await buzon.getByRole('cell', { name: /código de seguridad/ }).first().innerText();
  const codigo = texto.match(/\d{6}/)![0];

  await page.getByLabel('Código de seguridad').fill(codigo);
  await page.getByRole('button', { name: 'Validar' }).click();
  await expect(page.getByRole('heading', { name: 'Mis cuentas' })).toBeVisible();

  await page.goto('http://127.0.0.1:4000/transferir');
  await page.getByLabel('Cuenta destino').fill('2000000001');
  await page.getByLabel('Monto').fill('100000');
  await page.getByLabel('Acepto el cobro del 4x1000').check();
  await page.getByRole('button', { name: 'Transferir' }).click();

  await expect(page.getByRole('status')).toContainText('Transferencia exitosa');
  await expect(page.locator('#gmf')).toHaveText('$400');
});
