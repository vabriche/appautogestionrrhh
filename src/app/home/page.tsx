import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";
import { rutaInicio } from "@/lib/roles";

export default async function HomePage() {
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(rutaInicio(user.encargadoArea));
}
