// encargado_area: "S" = encargado de su área, "T" = titular (todas las áreas), "N" = agente sin cargo.
export function normalizarEncargadoArea(valor: unknown): string {
  return String(valor ?? "N").trim().toUpperCase() || "N";
}

export function esEncargado(encargadoArea: unknown): boolean {
  const valor = normalizarEncargadoArea(encargadoArea);
  return valor === "S" || valor === "T";
}

export function rutaInicio(encargadoArea: unknown): string {
  return esEncargado(encargadoArea) ? "/supervision/personal" : "/asistencia";
}
