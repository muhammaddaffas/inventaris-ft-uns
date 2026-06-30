import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("ft_user");

  if (userCookie?.value) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      if (user.role === "pengelola" || user.role === "admin") {
        redirect("/dashboard");
      }
      redirect("/barang");
    } catch {
      redirect("/login");
    }
  }

  redirect("/login");
}
