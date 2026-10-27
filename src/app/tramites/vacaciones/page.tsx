import { VacacionesView } from "@/views/vacaciones/Vacaciones.view";
import { getAuthUserAction } from "@/controllers/auth.controller";
import { redirect } from "next/navigation";

export default async function VacacionesPage() {
  const user = await getAuthUserAction();

  if (!user) {
    redirect("/login");
  }

  return <VacacionesView />;
}
