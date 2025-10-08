import { useState } from "react";
import "./Home.css";
import { Page } from "../components/Page";
import { Link } from "react-router-dom";

export const Home = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Accueil</h1>
      <p>Bienvenue sur l'application Statify 🚀</p>
    </div>
  );
};
