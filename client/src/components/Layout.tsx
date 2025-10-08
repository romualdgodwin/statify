// client/src/components/Layout.tsx
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header avec navigation intégrée */}
      <Header title="Statify" />

      {/* Contenu principal */}
      <main className="flex-fill container py-3">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
