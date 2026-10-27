export interface ReglaCupo {
  tipo: "RAZONES_PARTICULARES" | "EXCEPCIONALES" | "ESTUDIO";
  nombre: string;
  maxAnual: number;
  maxMensual: number | null;
  maxPorSolicitud: number | null;
  descripcion: string;
}

export const REGLAS_CUPO: Record<string, ReglaCupo> = {
  RAZONES_PARTICULARES: {
    tipo: "RAZONES_PARTICULARES",
    nombre: "Razones Particulares",
    maxAnual: 6,
    maxMensual: 2,
    maxPorSolicitud: 2,
    descripcion: "6 días al año (máx. 2 por mes)",
  },
  EXCEPCIONALES: {
    tipo: "EXCEPCIONALES",
    nombre: "Permisos Excepcionales (Art. 102)",
    maxAnual: 5,
    maxMensual: 2,
    maxPorSolicitud: 2,
    descripcion: "5 días al año (máx. 2 por mes)",
  },
  ESTUDIO: {
    tipo: "ESTUDIO",
    nombre: "Estudio",
    maxAnual: 28,
    maxMensual: null,
    maxPorSolicitud: 5,
    descripcion: "28 días al año (máx. 5 por examen)",
  },
};

const normalizar = (texto: string): string =>
  String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/**
 * Identifica si un motivo corresponde a una regla de cupos legales.
 */
export const obtenerReglaCupo = (motivoTexto?: string | null): ReglaCupo | null => {
  if (!motivoTexto) return null;
  const norm = normalizar(motivoTexto);

  // Excluir explícitamente "mesa examinadora" de la regla de Estudio
  if (norm.includes("mesa examinadora") || norm.includes("mesas examinadoras")) {
    return null;
  }

  // 1. Razones particulares
  if (
    norm.includes("razones particulares") ||
    norm.includes("razon particular") ||
    norm.includes("permiso particular") ||
    norm.includes("motivos particulares")
  ) {
    return REGLAS_CUPO.RAZONES_PARTICULARES;
  }

  // 2. Excepcionales (102)
  if (
    norm.includes("excepcional") ||
    norm.includes("excepcionales") ||
    norm.includes("102")
  ) {
    return REGLAS_CUPO.EXCEPCIONALES;
  }

  // 3. Estudio / Rendir exámenes
  if (
    norm.includes("estudio") ||
    norm.includes("rendir examen") ||
    norm.includes("rendir examenes") ||
    norm.includes("examen")
  ) {
    return REGLAS_CUPO.ESTUDIO;
  }

  return null;
};
