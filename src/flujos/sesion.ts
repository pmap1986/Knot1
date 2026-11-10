/**
 * CAPA DE FLUJOS: pasos de negocio que combinan varias pantallas o servicios.
 * Una prueba dice "inicia sesión" y no se preocupa por los 6 pasos que hay detrás.
 */
import { Page } from '@playwright/test';
import { ClienteBanco } from '../api/ClienteBanco';
import { Usuario, usuarios } from '../datos/usuarios';
import { PaginaBuzon } from '../paginas/PaginaBuzon';
import { PaginaInicio } from '../paginas/PaginaInicio';
import { PaginaLogin } from '../paginas/PaginaLogin';
import { PaginaOtp } from '../paginas/PaginaOtp';

/** Las pantallas que participan en el ingreso. Las entrega el fixture "paginas". */
export interface PaginasDeIngreso {
  login: PaginaLogin;
  otp: PaginaOtp;
  buzon: PaginaBuzon;
  inicio: PaginaInicio;
}

/**
 * Ingreso completo por la pantalla, como lo haría el cliente.
 * Úsalo solo en las pruebas cuyo objetivo ES el ingreso.
 */
export async function iniciarSesionPorUi(paginas: PaginasDeIngreso, usuario: Usuario): Promise<void> {
  // TODO RETO 5: arma el ingreso con las piezas de los retos 1 y 2.
  //   1. Abre la pantalla de login e ingresa con usuario.usuario y usuario.clave.
  //   2. Espera a que cargue la pantalla del código:  await paginas.otp.esperarQueCargue();
  //   3. Lee el código en el buzón:  const codigo = await paginas.buzon.leerUltimoCodigo(usuario.usuario);
  //   4. Valida el código en la pantalla OTP y espera a que cargue la pantalla de inicio.
  // Pista: cada paso es una línea con "await". Haz primero los retos 1 y 2.
  // Cuando termines, borra la línea "throw" de abajo.
  throw new Error('PENDIENTE (S3): completa iniciarSesionPorUi en flujos/sesion.ts — ver retos/S03.md, reto 5');
}

/**
 * Deja el navegador con la sesión abierta, SIN pasar por las pantallas de ingreso.
 * Inicia sesión por API y guarda el token donde la página lo busca (localStorage).
 * Úsalo en las pruebas cuyo objetivo NO es el ingreso: son más rápidas y estables.
 */
export async function abrirConSesion(page: Page, cliente: ClienteBanco, usuario: Usuario = usuarios.ana): Promise<void> {
  const { token, nombre } = await cliente.iniciarSesion(usuario);
  await page.addInitScript(([t, n]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('nombre', n);
  }, [token, nombre]);
}
