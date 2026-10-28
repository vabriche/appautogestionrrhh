import "server-only";
import { unstable_rethrow } from "next/navigation";
import { api } from "@/lib/api";
import { SupervisionRegistroSchema, type SupervisionRegistro } from "@/models";
import { z } from "zod";

export const supervisionService = {
  async getRegistrosArea(
    area: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<SupervisionRegistro[]> {
    try {
      // Reemplazamos los espacios por _ porque el backend lo espera así
      const encodedArea = encodeURIComponent(area.replace(/ /g, "_"));
      const rows = await api.get<unknown[]>(
        `/biometrico/horas_area_fecha/${encodedArea}/${fechaInicio}/${fechaFin}`
      );

      if (!rows || !Array.isArray(rows)) return [];

      const parsed = z.array(SupervisionRegistroSchema).safeParse(rows);
      if (!parsed.success) {
        console.error("Error validando registros de supervisión:", parsed.error);
        return [];
      }
      return parsed.data;
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error en getRegistrosArea:", error);
      return [];
    }
  },
};
