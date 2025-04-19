import React from "react";
import DashboardComponent from "../sections/DashboardComponent";

const DashboardPage = () => {
  return (
    <main className="max-w-screen-xl mx-auto flex flex-col justify-center items-center px-6 h-screen">
      <section className="flex flex-col justify-center items-center w-full max-h-[500px] h-full bg-amber-300 rounded-2xl">
        <DashboardComponent />
      </section>
    </main>
  );
};

export default DashboardPage;
