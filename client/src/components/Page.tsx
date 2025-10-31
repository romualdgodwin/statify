import { PropsWithChildren } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * 📄 Composant Page
 * Sert de conteneur standard pour une page complète :
 * - Affiche un Header avec un titre
 * - Le contenu principal (children)
 * - Et le Footer global
 */
export type PageProps = {
  /** Titre de la page affiché dans le header */
  title: string;
};

export const Page = ({ title, children }: PropsWithChildren<PageProps>) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#121212", // fond cohérent avec ton thème
        color: "#f0f0f0",
      }}
    >
      {/* 🧭 En-tête */}
      <Header title={title} />

      {/* 🧩 Contenu principal */}
      <main
        role="main"
        style={{
          flex: 1,
          padding: "80px 1rem 2rem", // espace pour header sticky
          textAlign: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {children}
      </main>

      {/* 📍 Pied de page */}
      <Footer />
    </div>
  );
};
