import { Locator, Page } from '@playwright/test';

/**
 * CLASE PADRE (abstracta): lo que todas las pantallas del banco tienen en común.
 *
 * - "abstract" quiere decir que nadie crea una PaginaBase sola: siempre se crea una hija
 *   (PaginaLogin, PaginaInicio...). La hija HEREDA todo lo que está aquí.
 * - Una CLASE es el molde. Un OBJETO es lo que sale del molde: new PaginaLogin(page).
 */
export abstract class PaginaBase {
  /** El mensaje de error rojo. Todas las pantallas lo muestran igual (role="alert"). */
  readonly mensajeDeError: Locator;

  /**
   * CONSTRUCTOR: lo que la clase necesita para existir. Aquí, la pestaña del navegador.
   * "protected" significa: la usan esta clase y sus hijas, pero las pruebas no la tocan.
   */
  constructor(protected readonly page: Page) {
    this.mensajeDeError = page.getByRole('alert');
  }

  /** Cada pantalla dice cuál es su dirección. La hija está obligada a escribirla. */
  abstract readonly ruta: string;

  /**
   * POLIMORFISMO: el mismo método abre una pantalla distinta según la clase hija,
   * porque cada hija tiene su propia ruta.
   */
  async abrir(): Promise<void> {
    await this.page.goto(this.ruta);
  }

  /** Espera hasta que el navegador llegue a la dirección de esta pantalla. */
  async esperarQueCargue(): Promise<void> {
    await this.page.waitForURL((url) => url.pathname === this.ruta);
  }
}
