// app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies(); // 👈 usar await
  const token = cookieStore.get("token");

  if (token) {
    return redirect("/dashboard");
  }

  return redirect("/login");
}
