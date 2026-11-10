import { Locator, Page } from '@playwright/test';
import { PaginaBase } from './PaginaBase';

/** Lo que se necesita para una transferencia. Los campos con "?" son opcionales. */
export interface DatosTransferencia {
  /** Número de la cuenta de origen. Si no se indica, queda la que viene seleccionada (Ahorros). */
  origen?: string;
  destino: string;
  monto: number;
  /** Marcar la casilla del 4x1000. Si no se indica, se marca. */
  aceptar4x1000?: boolean;
}

/** Pantalla "Transferir". */
export class PaginaTransferir extends PaginaBase {
  readonly ruta = '/transferir';
  readonly comprobante: Locator;
  private readonly listaOrigen: Locator;
  private readonly campoDestino: Locator;
  private readonly campoMonto: Locator;
  private readonly casilla4x1000: Locator;
  private readonly botonTransferir: Locator;

  constructor(page: Page) {
    super(page);
    this.comprobante = page.getByRole('status');
    this.listaOrigen = page.getByLabel('Cuenta de origen');
    this.campoDestino = page.getByLabel('Cuenta destino');
    this.campoMonto = page.getByLabel('Monto');
    this.casilla4x1000 = page.getByLabel('Acepto el cobro del 4x1000');
    this.botonTransferir = page.getByRole('button', { name: 'Transferir' });
  }

  /** Llena el formulario y pulsa Transferir. */
  async transferir({ origen, destino, monto, aceptar4x1000 = true }: DatosTransferencia): Promise<void> {
    // TODO RETO 3: llena el formulario y pulsa Transferir.
    //   1. Si viene "origen", elígelo en la lista:  await this.listaOrigen.selectOption(origen);
    //   2. Escribe el destino y el monto. Ojo: fill() recibe texto, así que usa String(monto).
    //   3. Si aceptar4x1000 es true, marca la casilla con .check().
    //   4. Pulsa el botón Transferir.
    // Pista: para el paso 1 y el 3 usa un "if", por ejemplo: if (origen) { ... }
    // Cuando termines, borra la línea "throw" de abajo.
    throw new Error('PENDIENTE (S3): completa PaginaTransferir.transferir — ver retos/S03.md, reto 3');
  }

  /** Espera la respuesta del banco y devuelve el texto del comprobante o del error. */
  async esperarResultado(): Promise<string> {
    const resultado = this.comprobante.or(this.mensajeDeError);
    await resultado.waitFor();
    return (await resultado.innerText()).trim();
  }
}
