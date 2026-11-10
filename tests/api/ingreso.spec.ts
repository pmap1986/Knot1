/**
 * Pruebas de API del ingreso, con la clase ClienteBanco (src/api).
 * Lo mismo que harías en Postman, pero se repite solo.
 */
import { usuarios } from '../../src/datos/usuarios';
import { hallazgoEsperado } from '../../src/soporte/hallazgos';
import { test, expect } from '../../src/soporte/fixtures';

test('login con datos correctos entrega un desafío OTP', async ({ cliente }) => {
  const { estado, datos } = await cliente.login(usuarios.ana.usuario, usuarios.ana.clave);

  expect(estado).toBe(200);
  expect(datos.idDesafio).toBeTruthy();
});

test('login con clave errada responde 401', async ({ cliente }) => {
  const { estado, datos } = await cliente.login(usuarios.conClaveErrada.usuario, usuarios.conClaveErrada.clave);

  expect(estado).toBe(401);
  expect(datos.error).toBe('Usuario o clave incorrectos');
});

test('un usuario bloqueado recibe 423', async ({ cliente }) => {
  const { estado } = await cliente.login(usuarios.bloqueado.usuario, usuarios.bloqueado.clave);

  expect(estado).toBe(423);
});

test('un usuario bloqueado escrito en MAYÚSCULAS también recibe 423', async ({ cliente }) => {
  hallazgoEsperado('BUG-03', 'el usuario BLOQUEADO en mayúsculas puede entrar');

  const { estado } = await cliente.login(usuarios.bloqueadoEnMayusculas.usuario, usuarios.bloqueadoEnMayusculas.clave);

  expect(estado).toBe(423);
});

test('con el código del buzón se obtiene una sesión', async ({ cliente }) => {
  const { nombre } = await cliente.iniciarSesion(usuarios.ana);

  expect(nombre).toBe('Ana Pérez');
});
