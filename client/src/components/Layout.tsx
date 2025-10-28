import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header fixé */}
      <Header title="Statify" />

      {/* Contenu principal */}
      <main
        role="main"
        style={{
          flex: 1,
          paddingTop: "70px", // compense le header sticky
          display: "flex",
          justifyContent: "center", // centré horizontalement
          alignItems: "flex-start", // contenu démarre en haut (mieux pour scroll)
          width: "100%",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1200px", // limite de largeur pour lisibilité
            textAlign: "center",
          }}
        >
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};
