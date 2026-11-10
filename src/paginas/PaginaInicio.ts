import { Locator, Page } from '@playwright/test';
import { PaginaBase } from './PaginaBase';

/**
 * Pantalla "Mis cuentas". Esta clase está COMPLETA: úsala como modelo para tus retos.
 *
 * Fíjate en tres cosas:
 * 1. "extends PaginaBase": hereda abrir(), esperarQueCargue() y mensajeDeError.
 * 2. Los localizadores se escriben UNA vez, en el constructor.
 * 3. Los métodos hablan como el caso manual: saldoDe('Ahorros').
 */
export class PaginaInicio extends PaginaBase {
  readonly ruta = '/inicio';
  readonly titulo: Locator;
  readonly nombreDelCliente: Locator;

  constructor(page: Page) {
    super(page); // primero se arma la parte de la clase padre
    this.titulo = page.getByRole('heading', { name: 'Mis cuentas' });
    this.nombreDelCliente = page.locator('#nombre');
  }

  /** Devuelve el saldo que ve el cliente, por ejemplo "$1.500.000". */
  async saldoDe(tipoDeCuenta: string): Promise<string> {
    const fila = this.page.getByRole('row').filter({ hasText: tipoDeCuenta });
    // Los saldos tardan en llegar: waitFor espera a que la fila aparezca, sin pausas fijas.
    await fila.waitFor();
    return (await fila.getByRole('cell').nth(2).innerText()).trim();
  }
}
