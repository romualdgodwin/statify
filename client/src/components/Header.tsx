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
  // ⚡️ On prend bien `token` (appToken JWT interne), pas `spotifyAccessToken`
  const { token, logout, role } = useAuth();
  const navigate = useNavigate();
  const [spotifyProfile, setSpotifyProfile] = useState<SpotifyProfile | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Charger le profil Spotify via backend sécurisé
  useEffect(() => {
    const fetchSpotifyProfile = async () => {
      if (token) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/spotify/me`, {
            headers: { Authorization: `Bearer ${token}` }, // ✅ JWT interne
          });
          setSpotifyProfile(res.data);
        } catch (err) {
          console.error("❌ Erreur récupération profil Spotify :", err);
        }
      }
    };
    fetchSpotifyProfile();
  }, [token]);

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      fixed="top"
      className="px-3 w-100 shadow-sm"
    >
      {/* Logo / Titre */}
      <Navbar.Brand as={Link} to={role === "admin" ? "/users" : "/spotify-dashboard"}>
        {title}
      </Navbar.Brand>

      {/* Toggle mobile */}
      <Navbar.Toggle aria-controls="main-navbar-nav" />
      <Navbar.Collapse id="main-navbar-nav" className="justify-content-between">
        <Nav className="me-auto">
          {token && role === "admin" && (
            <>
              <Nav.Link as={Link} to="/admin-dashboard">Dashboard Admin</Nav.Link>
              <Nav.Link as={Link} to="/users">Users</Nav.Link>
              <Nav.Link as={Link} to="/create-user">Créer un utilisateur</Nav.Link>
              <Nav.Link as={Link} to="/mon-compte">Mon Compte</Nav.Link>
            </>
          )}

          {token && role === "user" && (
            <>
              <Nav.Link as={Link} to="/spotify-dashboard">Spotify Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/mon-compte">Mon Compte</Nav.Link>
            </>
          )}
        </Nav>

        {/* Actions utilisateur */}
        <Nav className="align-items-center">
          {token ? (
            <>
              <Image
                src={spotifyProfile?.images?.[0]?.url || "https://via.placeholder.com/32"}
                roundedCircle
                className="me-2"
                alt={spotifyProfile?.display_name || "Avatar utilisateur"}
                width={32}
                height={32}
              />
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleLogout}
                aria-label="Déconnexion"
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <Nav.Link as={Link} to="/login">Connexion</Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
