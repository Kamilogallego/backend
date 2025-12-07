/**
 * Convierte un número a su representación en letras (español colombiano)
 * Ej: 1500000 -> "Un Millón Quinientos Mil Pesos M/Cte."
 */
export class NumeroALetras {
  private static unidades = [
    '', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve',
  ];

  private static decenas = [
    '', 'Diez', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta',
    'Sesenta', 'Setenta', 'Ochenta', 'Noventa',
  ];

  private static especiales = [
    'Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince',
    'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve',
  ];

  private static centenas = [
    '', 'Ciento', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos',
    'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos',
  ];

  /**
   * Convierte un número de centavos a pesos con formato en letras
   * @param centavos Monto en centavos
   * @returns String en formato "X Pesos M/Cte."
   */
  static convertirCentavosAPesos(centavos: number): string {
    const pesos = Math.floor(centavos / 100);
    return this.convertir(pesos) + ' Pesos M/Cte.';
  }

  /**
   * Convierte un número entero a letras
   * @param numero Número a convertir
   * @returns String con el número en letras
   */
  static convertir(numero: number): string {
    if (numero === 0) return 'Cero';
    if (numero < 0) return 'Menos ' + this.convertir(-numero);

    let resultado = '';

    // Billones
    if (numero >= 1000000000000) {
      const billones = Math.floor(numero / 1000000000000);
      resultado += this.convertirGrupo(billones) + ' Billón';
      if (billones > 1) resultado += 'es';
      numero %= 1000000000000;
      if (numero > 0) resultado += ' ';
    }

    // Millones
    if (numero >= 1000000) {
      const millones = Math.floor(numero / 1000000);
      if (millones === 1) {
        resultado += 'Un Millón';
      } else {
        resultado += this.convertirGrupo(millones) + ' Millones';
      }
      numero %= 1000000;
      if (numero > 0) resultado += ' ';
    }

    // Miles
    if (numero >= 1000) {
      const miles = Math.floor(numero / 1000);
      if (miles === 1) {
        resultado += 'Mil';
      } else {
        resultado += this.convertirGrupo(miles) + ' Mil';
      }
      numero %= 1000;
      if (numero > 0) resultado += ' ';
    }

    // Centenas, decenas y unidades
    if (numero > 0) {
      resultado += this.convertirGrupo(numero);
    }

    return resultado.trim();
  }

  private static convertirGrupo(numero: number): string {
    if (numero === 0) return '';
    if (numero === 100) return 'Cien';

    let resultado = '';

    // Centenas
    const centena = Math.floor(numero / 100);
    if (centena > 0) {
      resultado += this.centenas[centena] + ' ';
      numero %= 100;
    }

    // Decenas y unidades
    if (numero >= 10 && numero < 20) {
      // Números especiales del 10 al 19
      resultado += this.especiales[numero - 10];
    } else if (numero >= 20 && numero < 30) {
      // Veintitantos
      const unidad = numero % 10;
      if (unidad === 0) {
        resultado += 'Veinte';
      } else {
        resultado += 'Veinti' + this.unidades[unidad].toLowerCase();
      }
    } else {
      // Decenas normales
      const decena = Math.floor(numero / 10);
      const unidad = numero % 10;

      if (decena > 0) {
        resultado += this.decenas[decena];
        if (unidad > 0) resultado += ' y ';
      }

      if (unidad > 0) {
        resultado += this.unidades[unidad];
      }
    }

    return resultado.trim();
  }
}
