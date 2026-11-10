import { Locator, Page } from '@playwright/test';
import { PaginaBase } from './PaginaBase';

/**
 * Buzón de SMS de pruebas: la herramienta interna donde el equipo consulta los códigos OTP.
 * Esta clase está COMPLETA. Se abre en su propia pestaña (ver soporte/fixtures.ts).
 */
export class PaginaBuzon extends PaginaBase {
  readonly ruta = '/buzon';
  private readonly campoUsuario: Locator;
  private readonly botonBuscar: Locator;
  private readonly mensajes: Locator;

  constructor(page: Page) {
    super(page);
    this.campoUsuario = page.getByLabel('Usuario');
    this.botonBuscar = page.getByRole('button', { name: 'Buscar' });
    this.mensajes = page.getByRole('cell', { name: /código de seguridad/ });
  }

  /** Busca los mensajes del usuario y devuelve los 6 dígitos del más reciente. */
  async leerUltimoCodigo(usuario: string): Promise<string> {
    await this.abrir();
    await this.campoUsuario.fill(usuario);
    await this.botonBuscar.click();
    const texto = await this.mensajes.first().innerText();
    const codigo = texto.match(/\d{6}/);
    if (!codigo) throw new Error(`El buzón de ${usuario} no tiene un código de 6 dígitos: "${texto}"`);
    return codigo[0];
  }
}
