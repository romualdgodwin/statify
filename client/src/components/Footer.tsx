import { Container } from "react-bootstrap";

export const Footer = () => {
  return (
    <footer style={{ background: "#222", color: "white", padding: "1rem 0", textAlign: "center" }}>
      <Container>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Statify - Tous droits réservés</p>
      </Container>
    </footer>
  );
};
