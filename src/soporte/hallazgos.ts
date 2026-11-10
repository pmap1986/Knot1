import { test } from '@playwright/test';

/**
 * Marca una prueba que DEBE fallar porque encontró un bug conocido del Banco Demo.
 *
 * La prueba se escribe con el resultado CORRECTO. Como el bug existe, falla, y Playwright
 * la cuenta como "falla esperada": la suite queda en verde y el hallazgo queda registrado.
 * Si algún día corrigen el bug, la prueba pasa y Playwright avisa: es hora de quitar la marca.
 */
export function hallazgoEsperado(id: string, descripcion: string): void {
  test.info().annotations.push({ type: 'hallazgo', description: `${id}: ${descripcion}` });
  test.fail();
}
