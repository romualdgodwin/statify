import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * 📦 Layout global de l’application
 * Contient le header, le contenu principal (Outlet) et le footer.
 * Structure commune à toutes les pages.
 */
export const Layout = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#121212", // ✅ fond global
        color: "#f0f0f0", // ✅ couleur de texte standard
      }}
    >
      {/* 🧭 En-tête fixe */}
      <Header title="Statify" />

      {/* 🧩 Contenu principal */}
      <main
        id="main-content"
        role="main"
        style={{
          flex: 1,
          paddingTop: "80px", // compense le header sticky
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          {/* ✅ Les routes enfants s'affichent ici */}
          <Outlet />
        </div>
      </main>

      {/* 📍 Pied de page */}
      <Footer />
    </div>
  );
};
