import React from "react";
import DashboardComponent from "../sections/DashboardComponent";
// import { SectionCards } from "../sections/SectionCards";

const DashboardPage = () => {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardComponent />
      {/* <div className="@container/main flex flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <SectionCards />
        </div>
      </div> */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <div className="aspect-video rounded-xl bg-gray-500" />
        <div className="aspect-video rounded-xl bg-gray-500" />
      </div>
    </main>
  );
};

export default DashboardPage;
