import { Navbar, Nav, Button, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSpotifyProfile } from "../hooks/useSpotifyProfile";

export const Header = ({ title }: { title: string }) => {
  const { token, logout, role } = useAuth();
  const navigate = useNavigate();
  const spotifyProfile = useSpotifyProfile();

  const isAdmin = role === "admin";
  const isUser = role === "user";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className="px-3 shadow-sm">
      <Navbar.Brand as={Link} to={isAdmin ? "/users" : "/spotify-dashboard"}>
        {title}
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="main-navbar-nav" />
      <Navbar.Collapse id="main-navbar-nav" className="justify-content-between">
        <Nav className="me-auto">
          {isAdmin && (
            <>
              <Nav.Link as={Link} to="/admin-dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/users">Utilisateurs</Nav.Link>
              <Nav.Link as={Link} to="/admin-badges">Badges</Nav.Link>
            </>
          )}
          {isUser && (
            <>
              <Nav.Link as={Link} to="/spotify-dashboard">Dashboard Spotify</Nav.Link>
              <Nav.Link as={Link} to="/mon-compte">Mon Compte</Nav.Link>
            </>
          )}
        </Nav>

        <Nav className="align-items-center">
          {token ? (
            <>
              <Image
                src={spotifyProfile?.images?.[0]?.url || "https://via.placeholder.com/32"}
                roundedCircle
                width={32}
                height={32}
                className="me-2"
                alt="Profil Spotify"
              />
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
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
