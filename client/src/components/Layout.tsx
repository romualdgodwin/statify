import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header fixé */}
      <Header title="Statify" />

      {/* Contenu principal centré */}
     <main
  style={{
    flex: 1,
    paddingTop: "70px", // compense le header
    display: "flex",
    justifyContent: "center",   // horizontal
    alignItems: "center",       // vertical
    width: "100%",
  }}
>
  <div
    style={{
      width: "100%",
      maxWidth: "1200px", // limite optionnelle
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
