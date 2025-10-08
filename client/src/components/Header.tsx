// client/src/components/Header.tsx
import { Navbar, Nav, Button, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

type HeaderProps = {
  title: string;
};

type SpotifyProfile = {
  display_name: string;
  images?: { url: string }[];
};

export const Header = ({ title }: HeaderProps) => {
  const { token, logout, spotifyAccessToken } = useAuth();
  const navigate = useNavigate();
  const [spotifyProfile, setSpotifyProfile] = useState<SpotifyProfile | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Charger le profil Spotify si connecté
  useEffect(() => {
    const fetchSpotifyProfile = async () => {
      if (spotifyAccessToken) {
        try {
          const res = await axios.get("http://localhost:3000/spotify/me", {
            headers: { Authorization: `Bearer ${spotifyAccessToken}` },
          });
          setSpotifyProfile(res.data);
        } catch (err) {
          console.error("Erreur récupération profil Spotify", err);
        }
      }
    };
    fetchSpotifyProfile();
  }, [spotifyAccessToken]);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
      {/* Logo / Titre */}
      <Navbar.Brand as={Link} to="/">
        {title}
      </Navbar.Brand>

      {/* Toggle pour mobile */}
      <Navbar.Toggle aria-controls="main-navbar-nav" />
      <Navbar.Collapse id="main-navbar-nav">
        {/* Liens de navigation */}
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">
            Home
          </Nav.Link>
          <Nav.Link as={Link} to="/users">
            Users
          </Nav.Link>
          <Nav.Link as={Link} to="/createUser">
            Create User
          </Nav.Link>
          <Nav.Link as={Link} to="/plop">
            Plop
          </Nav.Link>
          {token && (
            <Nav.Link as={Link} to="/mon-compte">
              Mon Compte
            </Nav.Link>
          )}
        </Nav>

        {/* Actions utilisateur */}
        <Nav className="align-items-center">
          {token ? (
            <>
              {/* Avatar Spotify ou défaut */}
              <Image
                src={
                  spotifyProfile?.images?.[0]?.url ||
                  "https://via.placeholder.com/32"
                }
                roundedCircle
                className="me-2"
                alt="avatar"
                width={32}
                height={32}
              />
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <Nav.Link as={Link} to="/login">
              Connexion
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
