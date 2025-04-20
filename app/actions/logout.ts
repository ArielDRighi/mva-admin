// utils/logout.ts
"use client";

import { deleteCookie } from "cookies-next";

export function logoutUser() {
  deleteCookie("token");
  deleteCookie("user");
}