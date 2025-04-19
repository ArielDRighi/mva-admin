import React from "react";
import LoginComponent from "../sections/LoginComponent";

const LoginPage = () => {
  return (
    <main className="max-w-screen-xl mx-auto flex flex-col justify-center items-center px-6 h-screen">
      <section className="flex flex-col justify-center items-center w-full max-h-[500px] h-full">
        <LoginComponent />
      </section>
    </main>
  );
};

export default LoginPage;
