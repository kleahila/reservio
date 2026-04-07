import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";
import { TenantProvider } from "./hooks/useTenant";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <TenantProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TenantProvider>
    </AuthProvider>
  </React.StrictMode>,
);
