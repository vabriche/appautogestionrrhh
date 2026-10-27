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

  // Nombres exactos de la base de datos (tabla motina):
  "Congresos",
  "Donación sangre",
  "Estudio",
  "Mesa examinadora",
  "Trámites",
  "Nacimiento",
  "Fallecimiento",
  "Actividad deportiva",
  "Matrimonio",
  "Permiso particular",
];

const normalizar = (texto: string): string =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/**
 * Determina si un motivo dado requiere documento adjunto obligatorio/probatorio.
 * Contempla tanto los nombres largos oficiales como las abreviaturas de la tabla motina.
 */
export const requiereDocumentoJustificativo = (
  motivoTexto?: string | number | null
): boolean => {
  if (!motivoTexto) return false;
  const norm = normalizar(String(motivoTexto));

  // 1. Verificación contra las 11 categorías oficiales
  for (const cat of CATEGORIAS_CON_JUSTIFICATIVO) {
    const catNorm = normalizar(cat);
    if (norm === catNorm || norm.includes(catNorm) || catNorm.includes(norm)) {
      return true;
    }
  }

  // 2. Verificación por palabras clave de compatibilidad con motina
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
  ];

  return keywords.some((kw) => norm.includes(kw));
};
