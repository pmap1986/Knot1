/**
 * RETO 2 (S3) · PaginaOtp.validar — herencia.
 * El login de estas pruebas se hace por API para que el reto 2 no dependa del reto 1:
 * el cliente pide el código, y la página OTP se abre con el desafío guardado.
 */
import { usuarios } from '../../src/datos/usuarios';
import { test, expect } from '../../src/soporte/fixtures';

test.beforeEach(async ({ page, cliente, paginaOtp }) => {
  // Preparación: así llega el navegador a /otp sin usar la pantalla de login.
  const { datos } = await cliente.login(usuarios.ana.usuario, usuarios.ana.clave);
  await page.addInitScript(([id, usuario]) => {
    sessionStorage.setItem('idDesafio', id);
    sessionStorage.setItem('usuario', usuario);
  }, [datos.idDesafio!, usuarios.ana.usuario]);
  await paginaOtp.abrir();
});

test('con el código del buzón entra a Mis cuentas', async ({ cliente, paginaOtp, paginaInicio }) => {
  const codigo = await cliente.leerCodigo(usuarios.ana.usuario);

  await paginaOtp.validar(codigo);

  await expect(paginaInicio.titulo).toBeVisible();
});

test('con un código equivocado muestra el error', async ({ paginaOtp }) => {
  await paginaOtp.validar('000000');

  // mensajeDeError no está en PaginaOtp: lo heredó de PaginaBase.
  await expect(paginaOtp.mensajeDeError).toHaveText('Código incorrecto');
});
