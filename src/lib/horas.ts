/**
 * Convierte horasT a horas decimales.
 * Acepta número (8.5), texto decimal ("8.50") o texto de hora ("08:30" / "08:30:00").
 */
export function horasADecimal(valor: number | string | null | undefined): number {
  if (valor === null || valor === undefined || valor === "") return 0;
  if (typeof valor === "number") return isNaN(valor) ? 0 : valor;

  const texto = valor.trim();
  if (texto.includes(":")) {
    const [h = 0, m = 0, s = 0] = texto.split(":").map(Number);
    const total = h + m / 60 + s / 3600;
    return isNaN(total) ? 0 : total;
  }

  const n = Number(texto.replace(",", "."));
  return isNaN(n) ? 0 : n;
}

/**
 * Muestra horas decimales como horas y minutos: 6.5 -> "6 hs 30 min", 8 -> "8 hs", 0.75 -> "45 min".
 */
export function formatearHorasMinutos(horas: number): string {
  const totalMin = Math.round((isNaN(horas) ? 0 : horas) * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0 && m > 0) return `${m} min`;
  return m > 0 ? `${h} hs ${m} min` : `${h} hs`;
}
