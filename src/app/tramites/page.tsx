import { JustificacionesView } from "@/views/justificaciones/Justificaciones.view";
import { getAuthUserAction } from "@/controllers/auth.controller";
import { redirect } from "next/navigation";

export default async function TramitesPage() {
  const user = await getAuthUserAction();

  if (!user) {
    redirect("/login");
  }

  return <JustificacionesView />;
}
