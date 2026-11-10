/**
 * CAPA DE CONFIGURACIÓN: dónde están el sistema y las credenciales de prueba.
 *
 * Cada valor se puede cambiar con una variable de entorno sin tocar el código.
 * Si la variable no existe, se usa el valor por defecto (el Banco Demo local).
 *
 * Ejemplo en PowerShell, solo para esa terminal:
 *   $env:URL_BANCO = 'http://127.0.0.1:4001'
 *   npm.cmd test
 */
export const entorno = {
  /** Dirección del Banco Demo. */
  urlBase: process.env.URL_BANCO ?? 'http://127.0.0.1:4000',

  /** Usuario principal de las pruebas. */
  usuario: process.env.USUARIO_BANCO ?? 'ana',

  /** Clave de los usuarios de práctica. En un proyecto real, nunca la escribas en el código. */
  clave: process.env.CLAVE_BANCO ?? 'Clave123',
};
