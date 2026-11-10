import type { EstadoSaldo, EstadoTramo, TipoTramo, TramoVacaciones } from "@/models";

/** Textos para los códigos de excepción que devuelve la base (fuera de norma). */
export const MOTIVOS_NORMA: Record<string, string> = {
  INICIO_NO_HABIL: "La licencia empieza un día no laborable",
  POST_VENCIMIENTO: "El saldo de este periodo está vencido",
  INICIO_ANTES_VENTANA: "Empieza antes de la fecha habitual",
  REINTEGRO_POSTERIOR: "El reintegro es posterior al general",
  PARCIAL: "No toma todos los días que le corresponden",
  COMPENSACION: "Tramo por compensación",
  POST_COMPENSACION: "Resto de licencia después de una compensación",
};

export const textoMotivoNorma = (codigo: string): string =>
  MOTIVOS_NORMA[codigo.trim()] ?? codigo;

export const TIPOS_TRAMO: Record<TipoTramo, string> = {
  principal: "Principal",
  saldo: "Saldo",
  compensacion: "Compensación",
};

export const ESTADOS_TRAMO: Record<EstadoTramo, { label: string; className: string }> = {
  pedido: { label: "Pendiente de autorización", className: "bg-amber-50 text-amber-700 border-amber-200" },
  aprobado: { label: "Aprobado", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rechazado: { label: "Rechazado", className: "bg-red-50 text-red-700 border-red-200" },
  cancelado: { label: "Cancelado", className: "bg-gray-100 text-gray-600 border-gray-200" },
  gozado: { label: "Gozado", className: "bg-sky-50 text-sky-700 border-sky-200" },
};

type EstadoVisto = Pick<TramoVacaciones, "estado" | "vb_jefe_fecha" | "vb_jefe_por" | "autorizado_por">;

/** Estado para mostrar, separando el paso del jefe (visto bueno) del de RRHH (autorización). */
export const estadoTramo = (t: EstadoVisto): { label: string; className: string } => {
  if (t.estado === "pedido") {
    return t.vb_jefe_fecha
      ? { label: "Con visto bueno, pendiente de RRHH", className: "bg-amber-50 text-amber-700 border-amber-200" }
      : { label: "Pendiente de visto bueno del jefe", className: "bg-orange-50 text-orange-700 border-orange-200" };
  }
  if (t.estado === "rechazado" && t.vb_jefe_por && !t.autorizado_por) {
    return { label: "Rechazado por el jefe", className: ESTADOS_TRAMO.rechazado.className };
  }
  return ESTADOS_TRAMO[t.estado] ?? ESTADOS_TRAMO.pedido;
};

export const ESTADOS_SALDO: Record<EstadoSaldo, { label: string; className: string }> = {
  vigente: { label: "Vigente", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  vencido: { label: "Vencido", className: "bg-red-50 text-red-700 border-red-200" },
  completo: { label: "Completo", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

/** aaaa-mm-dd → dd/mm/aaaa (ignora la hora si viene). */
export const formatearFecha = (iso?: string | null): string => {
  if (!iso) return "-";
  const [fecha] = iso.split(" ");
  const partes = fecha.split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : iso;
};

const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** aaaa-mm-dd → "lunes 01/02/2027". */
export const formatearFechaConDia = (iso?: string | null): string => {
  if (!iso) return "-";
  const d = new Date(iso.split(" ")[0] + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return `${DIAS_SEMANA[d.getDay()]} ${formatearFecha(iso)}`;
};

/** 247 → "20 años y 7 meses". */
export const formatearMeses = (meses?: number | null): string => {
  if (meses == null) return "-";
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const a = `${anios} ${anios === 1 ? "año" : "años"}`;
  if (resto === 0) return a;
  return `${a} y ${resto} ${resto === 1 ? "mes" : "meses"}`;
};
