"use server";
import { cookies } from "next/headers";

export interface CreateTallesDto {
  calzado_talle: string;
  pantalon_talle: string;
  camisa_talle: string;
  campera_bigNort_talle: string;
  pielBigNort_talle: string;
  medias_talle: string;
  pantalon_termico_bigNort_talle: string;
  campera_polar_bigNort_talle: string;
  mameluco_talle: string;
}
export interface UpdateTallesDto {
  calzado_talle?: string;
  pantalon_talle?: string;
  camisa_talle?: string;
  campera_bigNort_talle?: string;
  pielBigNort_talle?: string;
  medias_talle?: string;
  pantalon_termico_bigNort_talle?: string;
  campera_polar_bigNort_talle?: string;
  mameluco_talle?: string;
}

export async function createMyClothing(
  employeeId: number,
  talles: CreateTallesDto
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/clothing/create/${employeeId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(talles),
    }
  );
  return response.json();
}

export async function getMyClothing(employeeId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/clothing/${employeeId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
}

export async function updateMyClothing(
  employeeId: number,
  talles: UpdateTallesDto
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/clothing/modify/${employeeId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(talles),
    }
  );
  return response.json();
}
