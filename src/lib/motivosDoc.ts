import { MOTIVOS_HABILITADOS } from "@/constants/motivosHabilitados";

/**
 * Categorías de motivos que requieren un justificativo de archivo adjunto.
 */
export const CATEGORIAS_CON_JUSTIFICATIVO = [
  // 11 Categorías oficiales descriptivas:
  "Asistencia a reuniones de carácter académico (Congresos, Simposios, etc.)",
  "Donación de sangre",
  "Para rendir exámenes",
  "Integrar mesas examinadoras",
  "Trámites",
  "Asistencia a tribunales",
  "Licencia Paternidad",
  "Fallecimiento Familiar",
  "Actividades deportivas o artísticas",
  "Por matrimonio",
  "Por matrimonio de un hijo",

  // Nombres exactos de la base de datos (tabla motina) y motivos habilitados:
  "Congresos",
  "Donación sangre",
  "Donación de Sangre",
  "Estudio",
  "Mesa examinadora",
  "Mesa Examinadora",
  "Trámites",
  "Nacimiento",
  "Fallecimiento",
  "Actividad deportiva",
  "Actividad Deportiva",
  "Matrimonio",
  "Licencia Extraordinaria 25",
  "Licencia extraordinaria 25",
  "Sindical",
];

const normalizar = (texto: string): string =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/**
 * Determina si un motivo dado requiere documento adjunto obligatorio/probatorio.
 * Contempla tanto los nombres largos oficiales como las abreviaturas de la tabla motina
 * y el listado de 15 motivos habilitados.
 */
export const requiereDocumentoJustificativo = (
  motivoTexto?: string | number | null,
  codina?: number | string | null
): boolean => {
  // 1. Verificación por codina explícito o si motivoTexto es un codina numérico
  const codVal =
    codina !== undefined && codina !== null && String(codina).trim() !== ""
      ? Number(codina)
      : typeof motivoTexto === "number" ||
        (typeof motivoTexto === "string" && /^\d+$/.test(motivoTexto.trim()))
      ? Number(motivoTexto)
      : null;

  if (codVal !== null && !isNaN(codVal)) {
    const found = MOTIVOS_HABILITADOS.find((m) => m.codina === codVal);
    if (found) {
      return found.requiereDoc;
    }
  }

  if (!motivoTexto) return false;
  const norm = normalizar(String(motivoTexto));

  // Exclusiones explícitas (no requieren documento probatorio)
  if (
    norm.includes("sin goce") ||
    norm.includes("con goce") ||
    norm.includes("razones particulares") ||
    norm.includes("razon particular") ||
    norm.includes("compensacion") ||
    norm.includes("102") ||
    norm.includes("excepcional")
  ) {
    return false;
  }

  // 2. Verificación contra las categorías oficiales y nombres de motina
  for (const cat of CATEGORIAS_CON_JUSTIFICATIVO) {
    const catNorm = normalizar(cat);
    if (norm === catNorm || norm.includes(catNorm) || catNorm.includes(norm)) {
      return true;
    }
  }

  // 3. Verificación por palabras clave de compatibilidad con motina
  const keywords = [
    "congreso",
    "simposio",
    "reuniones de caracter academico",
    "donacion sangre",
    "donacion de sangre",
    "rendir examen",
    "examenes",
    "estudio",
    "mesa examinadora",
    "mesas examinadoras",
    "tramite",
    "tramites",
    "tribunal",
    "tribunales",
    "paternidad",
    "fallecimiento",
    "actividad deportiva",
    "actividades deportivas",
    "artistica",
    "matrimonio",
    "sindical",
    "licencia extraordinaria",
  ];

  return keywords.some((kw) => norm.includes(kw));
};
