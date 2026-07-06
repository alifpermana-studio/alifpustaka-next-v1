"use client";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Showcase from "@/components/pages/showcase";

function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-full">
        <Showcase />
      </div>
    </div>
  );
}

export default Page;
