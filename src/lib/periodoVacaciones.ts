/**
 * Utilidades para determinar la vigencia del período de receso de vacaciones.
 *
 * El período de asistencia virtual está habilitado únicamente entre
 * el 21 de Diciembre y el 1 de Febrero (ambas fechas inclusive).
 */
export function esPeriodoRecesoVacaciones(fecha: Date = new Date()): boolean {
  const mes = fecha.getMonth(); // 0 = Ene, 1 = Feb, ..., 11 = Dic
  const dia = fecha.getDate();

  // Desde el 21 de Diciembre (mes 11, día >= 21)
  if (mes === 11 && dia >= 21) return true;

  // Todo el mes de Enero (mes 0, día 1 al 31)
  if (mes === 0) return true;

  // Hasta el 1 de Febrero inclusive (mes 1, día 1)
  if (mes === 1 && dia <= 1) return true;

  return false;
}

export function obtenerTextoPeriodoVacaciones(): string {
  return "21 de diciembre al 1 de febrero";
}
