import React from "react";
import { createRoot } from "react-dom/client";
import { Example } from "./Example.jsx";
import "./example.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Example />
  </React.StrictMode>,
);
