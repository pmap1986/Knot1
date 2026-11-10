import { Locator, Page } from '@playwright/test';
import { PaginaBase } from './PaginaBase';

/**
 * Pantalla del código de seguridad (OTP).
 *
 * HERENCIA: esta clase no escribe abrir(), esperarQueCargue() ni mensajeDeError.
 * Los recibe de PaginaBase porque dice "extends PaginaBase".
 */
export class PaginaOtp extends PaginaBase {
  readonly ruta = '/otp';
  readonly titulo: Locator;
  private readonly campoCodigo: Locator;
  private readonly botonValidar: Locator;

  constructor(page: Page) {
    super(page);
    this.titulo = page.getByRole('heading', { name: 'Confirma que eres tú' });
    this.campoCodigo = page.getByLabel('Código de seguridad');
    this.botonValidar = page.getByRole('button', { name: 'Validar' });
  }

  /** Escribe el código de 6 dígitos y pulsa Validar. */
  async validar(codigo: string): Promise<void> {
    // TODO RETO 2: escribe el código en su campo y pulsa el botón Validar.
    // Pista: es igual a PaginaLogin.ingresar, pero con un solo campo.
    // Cuando termines, borra la línea "throw" de abajo.
    throw new Error('PENDIENTE (S3): completa PaginaOtp.validar — ver retos/S03.md, reto 2');
  }
}
