import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";

export default async function RootPage() {
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.encargadoArea) {
    redirect("/supervision/personal");
  } else {
    redirect("/asistencia");
  }
}
