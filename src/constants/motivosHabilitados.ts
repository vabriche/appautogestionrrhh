export interface MotivoHabilitado {
  codina: number;
  label: string;
  requiereDoc: boolean;
  reglaCupoTipo?: "RAZONES_PARTICULARES" | "EXCEPCIONALES" | "ESTUDIO";
}

/**
 * Listado oficial de los 15 motivos habilitados por la Dirección
 * para solicitudes de justificación (inasistencias y licencias).
 */
export const MOTIVOS_HABILITADOS: MotivoHabilitado[] = [
  { codina: 2, label: "Estudio", requiereDoc: true, reglaCupoTipo: "ESTUDIO" },
  { codina: 4, label: "Razones Particulares con goce", requiereDoc: false, reglaCupoTipo: "RAZONES_PARTICULARES" },
  { codina: 31, label: "Razones Particulares sin goce", requiereDoc: false },
  { codina: 7, label: "Mesa Examinadora", requiereDoc: true },
  { codina: 8, label: "Matrimonio", requiereDoc: true },
  { codina: 11, label: "Congresos", requiereDoc: true },
  { codina: 13, label: "Fallecimiento", requiereDoc: true },
  { codina: 14, label: "Nacimiento", requiereDoc: true },
  { codina: 15, label: "Actividad Deportiva", requiereDoc: true },
  { codina: 19, label: "Donación de Sangre", requiereDoc: true },
  { codina: 23, label: "Trámites", requiereDoc: true },
  { codina: 25, label: "Licencia Extraordinaria 25", requiereDoc: true },
  { codina: 26, label: "Compensación", requiereDoc: false },
  { codina: 32, label: "Permiso Excepcional Art. 102", requiereDoc: false, reglaCupoTipo: "EXCEPCIONALES" },
  { codina: 36, label: "Sindical", requiereDoc: true },
];

export const CODINA_HABILITADOS = MOTIVOS_HABILITADOS.map((m) => m.codina);

export const OBTENER_LABEL_MOTIVO = (codina: number | string): string => {
  const match = MOTIVOS_HABILITADOS.find((m) => m.codina === Number(codina));
  return match ? match.label : "";
};
