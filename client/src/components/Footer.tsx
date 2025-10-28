import { Container } from "react-bootstrap";

export const Footer = () => {
  return (
    <footer role="contentinfo" className="bg-dark text-white text-center py-3 mt-auto">
      <Container>
        <p className="mb-0">
          © {new Date().getFullYear()} <strong>Statify</strong> — Tous droits réservés
        </p>
      </Container>
    </footer>
  );
};
