"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/actions/login";
import { setCookie } from "cookies-next";
import { useState } from "react";
import Image from "next/image";

const formSchema = z.object({
  username: z.string().min(3, { message: "El usuario es obligatorio" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
});

const LoginComponent = () => {
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setFormError("");

    try {
      const data = await loginUser(values.username, values.password);

      setCookie("token", data.access_token);
      setCookie("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err) {
      setFormError("Usuario o contraseña incorrectos");
      console.log(err);
    }
  };

  return (
    <Form {...form}>
      <div className="form_wrapper">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 form_main"
        >
          <Image src="/images/MVA_LogoPNG.png" alt="Logo" width={120} height={120} className="z-10"/>
          <h1 className="heading">Inicia sesión</h1>
          <div className="inputContainer">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel>Usuario</FormLabel>
                  <svg
                    className="inputIcon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#2e2e2e"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
                  </svg>
                  <FormControl>
                    <Input
                      placeholder="lopez456"
                      {...field}
                      id="username"
                      className="inputField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="inputContainer">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel>Contraseña</FormLabel>
                  <svg
                    className="inputIcon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#2e2e2e"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
                  </svg>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      id="password"
                      className="inputField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <Button type="submit" id="button">
            Iniciar sesión
          </Button>
        </form>
      </div>
    </Form>
  );
};

export default LoginComponent;
