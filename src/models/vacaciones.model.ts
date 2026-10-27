/**
 * Licencia anual ordinaria (vacaciones). Endpoints /vacaciones/empleado/* del backend:
 * el legajo sale del token, las reglas (saldo, reintegro, excepciones) las calcula la base.
 */

export type TipoTramo = "principal" | "saldo" | "compensacion";

export type EstadoTramo = "pedido" | "aprobado" | "rechazado" | "cancelado" | "gozado";

export type EstadoSaldo = "vigente" | "vencido" | "completo";

/** Forma en que el agente indica la extensión del tramo (solo una). */
export type ModoPedido = "dias" | "ultimo_dia" | "fecha_reintegro";

export interface AntiguedadVacaciones {
  fecha_ingreso: string;
  al: string; // fecha de corte (31/12 del año en curso)
  reconocida_meses: number;
  propia_meses: number;
  total_meses: number;
  dias_segun_escala: number;
}

export interface PeriodoVacaciones {
  periodo: number;
  sugerido: boolean;
  antiguedad_meses: number;
  dias_corresponden: number;
  dias_aprobados: number;
  dias_pendientes_autoriz: number;
  dias_devueltos: number;
  saldo: number;
  estado_saldo: EstadoSaldo;
  vencimiento: string;
  tiene_principal: boolean;
  fecha_limite_pedido: string;
  ventana: { desde: string; reintegro_general: string };
  ventana_sugerida: { inicio: string; ultimo_dia: string; reintegro: string } | null;
}

export interface ResumenVacaciones {
  legajo: number;
  apellido: string | null;
  activo: boolean;
  antiguedad: AntiguedadVacaciones;
  periodos: PeriodoVacaciones[];
}

export interface InterrupcionVacaciones {
  id: number;
  tramo_id: number;
  fecha_desde: string;
  fecha_hasta: string;
  dias: number;
  motivo: "enfermedad" | "trabajo" | "otro";
  tipo_referencia: string | null;
  nro_referencia: string | null;
  estado: "pendiente" | "validada" | "rechazada";
  observacion: string | null;
  fecha_validacion: string | null;
}

export interface TramoVacaciones {
  id: number;
  periodo: number;
  tipo: TipoTramo;
  fecha_inicio: string;
  dias_computados: number;
  fecha_fin_computo: string;
  fecha_reintegro: string;
  dias_corridos: number;
  estado: EstadoTramo;
  fuera_de_norma: number;
  motivos_norma: string | null;
  observacion: string | null;
  autorizado_por: number | null;
  fecha_autoriz: string | null;
  motivo_autoriz: string | null;
  creado: string;
  interrupciones: InterrupcionVacaciones[];
}

export interface PrepararPedidoPayload {
  periodo: number;
  tipo: TipoTramo;
  fecha_inicio: string;
  dias?: number;
  ultimo_dia?: string;
  fecha_reintegro?: string;
}

/** Simulación del tramo. `saldo` es el disponible antes del tramo; `error` es de negocio. */
export interface PrepararPedidoResult {
  dias: number | null;
  ultimo_dia: string | null;
  fecha_reintegro: string | null;
  saldo: number | null;
  motivos: string[];
  error: string | null;
}

export interface RegistrarTramoPayload {
  periodo: number;
  tipo: TipoTramo;
  fecha_inicio: string;
  dias: number;
  observacion?: string | null;
}

export interface RegistrarTramoResult {
  id: number;
  fecha_reintegro: string;
  estado: EstadoTramo;
  motivos: string[];
}
