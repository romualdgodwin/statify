import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";


export const Layout = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#121212", 
        color: "#f0f0f0", 
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
          paddingTop: "80px", 
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
