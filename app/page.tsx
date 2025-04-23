// app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);

      if (user.roles.includes("ADMIN") || user.roles.includes("SUPERVISOR")) {
        return redirect("/dashboard");
      } else if (user.roles.includes("OPERARIO")) {
        return redirect("/dashboard-employee");
      }
    } catch (error) {
      console.error("Error parsing user cookie:", error);
    }
  }

  return redirect("/login");
}
