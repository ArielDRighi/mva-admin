"use client";

import React, { useEffect, useState } from "react";
import { getCookie } from "cookies-next";

type User = {
  id: number;
  nombre: string;
  email: string;
  empleadoId: number | null;
  estado: string;
  roles: string[];
};

const DashboardComponent = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userCookie = getCookie("user");

    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie as string);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error al parsear el usuario", e);
      }
    }
  }, []);

  return (
    <div>
      <h1>Bienvenido, {user?.nombre}</h1>
      <p>Tu email es: {user?.email}</p>
    </div>
  );
};

export default DashboardComponent;
