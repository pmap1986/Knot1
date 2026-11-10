/**
 * CAPA DE DATOS: con qué datos se prueba.
 * Las pruebas piden "usuarios.ana" en lugar de repetir 'ana' y 'Clave123' en cada archivo.
 */
import { entorno } from '../config/entorno';

/** Un usuario de práctica: con qué entra y qué nombre debe ver en pantalla. */
export interface Usuario {
  usuario: string;
  clave: string;
  nombre: string;
}

export const usuarios = {
  ana: { usuario: entorno.usuario, clave: entorno.clave, nombre: 'Ana Pérez' },
  luis: { usuario: 'luis', clave: entorno.clave, nombre: 'Luis Gómez' },
  bloqueado: { usuario: 'bloqueado', clave: entorno.clave, nombre: 'Usuario Bloqueado' },
  bloqueadoEnMayusculas: { usuario: 'BLOQUEADO', clave: entorno.clave, nombre: 'Usuario Bloqueado' },
  conClaveErrada: { usuario: entorno.usuario, clave: 'otra', nombre: 'Ana Pérez' },
} satisfies Record<string, Usuario>;

/** Números de cuenta del Banco Demo. Cada sesión arranca con los mismos saldos. */
export const cuentas = {
  ahorros: { numero: '1000000001', tipo: 'Ahorros', saldoInicial: 1_500_000 },
  corriente: { numero: '1000000002', tipo: 'Corriente', saldoInicial: 250_000 },
  /** Una cuenta de otro cliente, para recibir transferencias. */
  destino: '2000000001',
};
