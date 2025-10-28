// client/src/pages/SpotifyDashboard.tsx
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Image,
  Spinner,
} from "react-bootstrap";

import { Pie, Line, Bar, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
  BarElement,
  Title,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
  BarElement,
  Title
);

// Types
type SpotifyArtist = {
  id: string;
  name: string;
  images?: { url: string }[];
  genres?: string[];
};

type SpotifyTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images?: { url: string }[] };
  preview_url?: string;
  popularity: number;
  duration_ms: number;
};

type Badge = {
  key: string;
  label: string;
  description: string;
  icon: string;
};

const ALL_BADGES: Badge[] = [
  { key: "first", label: "🎵 Premier pas", description: "Ton premier morceau écouté ! Bienvenue 🎉", icon: "🎵" },
  { key: "100plays", label: "💯 100 écoutes", description: "Tu as franchi la barre mythique des 100 écoutes.", icon: "💯" },
  { key: "nightowl", label: "🌙 Noctambule", description: "Écoutes après minuit... t’es un vrai hibou 🦉", icon: "🌙" },
  { key: "fan", label: "⭐ Fan d’un artiste", description: "Tu as écouté ton artiste préféré au moins 50 fois !", icon: "⭐" },
  { key: "marathon", label: "🔥 Marathon 7 jours", description: "Écoutes chaque jour pendant une semaine complète 🔥", icon: "🔥" },
  { key: "ironman", label: "🤖 Iron Man", description: "300 écoutes, ton armure musicale est forgée.", icon: "🤖" },
  { key: "hulk", label: "💪 Hulk", description: "Fan de Metal ? Tu déchaînes ta rage !", icon: "💪" },
  { key: "thor", label: "🔨 Thor", description: "Vendredi soir électrique, digne d’Asgard ⚡", icon: "⚡" },
  { key: "spiderman", label: "🕷️ Spiderman", description: "Tu explores +50 artistes différents 🕸️", icon: "🕷️" },
  { key: "cap", label: "🛡️ Captain America", description: "Tu te lèves tôt pour écouter ta musique 🇺🇸", icon: "🛡️" },
];

type SpotifyPlaylist = { id: string; name: string; images?: { url: string }[] };

type SpotifyProfile = {
  id: string;
  display_name: string;
  email: string;
  images?: { url: string }[];
};

type CompareResponse = {
  users: string[];
  avgPopularity: number[];
  genres: Record<string, number[]>;
};

export const SpotifyDashboard = () => {
  const { spotifyAccessToken, token } = useAuth();

  // Préview audio
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Comparaison utilisateurs
  const [compareUsers, setCompareUsers] = useState<string[]>([]);
  const [comparePopularity, setComparePopularity] = useState<number[]>([]);
  const [compareGenres, setCompareGenres] = useState<Record<string, number[]>>({});

  const handlePlayPreview = (previewUrl: string) => {
    if (currentPreview === previewUrl) {
      audioRef.current?.pause();
      setCurrentPreview(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(previewUrl);
      audioRef.current = audio;
      audio.play();
      setCurrentPreview(previewUrl);
      audio.onended = () => setCurrentPreview(null);
    }
  };

  // Loading / data
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);

  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [recentPlays, setRecentPlays] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [devices, setDevices] = useState<any[]>([]);

  const [artistLimit, setArtistLimit] = useState(5);
  const [trackLimit, setTrackLimit] = useState(5);
  const [activeTab, setActiveTab] = useState<"dashboard" | "stats">("dashboard");

  const [monthlyStats, setMonthlyStats] = useState<{ label: string; value: number }[]>([]);
  const [badges, setBadges] = useState<string[]>([]);

  // Devices → API Spotify directe (pas ton backend)
  useEffect(() => {
    const fetchDevices = async () => {
      if (!spotifyAccessToken) return;
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/player/devices", {
          headers: { Authorization: `Bearer ${spotifyAccessToken}` },
        });
        setDevices(res.data.devices || []);
      } catch (err) {
        console.error("❌ Erreur devices Spotify:", err);
      }
    };
    fetchDevices();
  }, [spotifyAccessToken]);

  // Fetch all backend data (passe uniquement par api)
  useEffect(() => {
    if (!spotifyAccessToken) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Tout ce qui suit passe par ton BACKEND -> api.get/post...
        const [
          profileRes,
          artistsRes,
          tracksRes,
          playlistsRes,
          recentRes,
          badgesResOrNull,
          compareRes,
          monthlyRes,
        ] = await Promise.all([
          api.get("/spotify/me"),
          api.get("/spotify/top-artists"),
          api.get("/spotify/top-tracks"),
          api.get("/spotify/playlists"),
          api.get("/spotify/recently-played"),
          token ? api.get("/spotify/badges") : Promise.resolve(null),
          api.get<CompareResponse>("/spotify/compare"),
          api.get("/spotify/monthly-stats"),
        ]);

        setProfile(profileRes.data);
        setTopArtists(artistsRes.data.items);
        setTopTracks(tracksRes.data.items);
        setPlaylists(playlistsRes.data.items);
        setRecentPlays(recentRes.data.items);

        if (badgesResOrNull) {
          setBadges(badgesResOrNull.data.badges || []);
        } else {
          setBadges([]);
        }

        setCompareUsers(compareRes.data.users || []);
        setComparePopularity(compareRes.data.avgPopularity || []);
        setCompareGenres(compareRes.data.genres || {});

        setMonthlyStats(monthlyRes.data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Erreur chargement Spotify :", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [spotifyAccessToken, token]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      // Recherche via TON BACKEND
      const res = await api.get("/spotify/search", {
        params: { query, type: "track" },
      });
      setSearchResults(res.data.tracks.items || []);
    } catch (err) {
      console.error("❌ Erreur recherche Spotify :", err);
    }
  };

  // Compter les types d'appareils (UI)
  const deviceCount: Record<string, number> = {};
  devices.forEach((d) => {
    const type = d.type || "Autre";
    deviceCount[type] = (deviceCount[type] || 0) + 1;
  });

  const deviceData = {
    labels: Object.keys(deviceCount),
    datasets: [
      {
        label: "Appareils utilisés",
        data: Object.values(deviceCount),
        backgroundColor: ["#1DB954", "#ff4d6d", "#4da6ff", "#f1c40f", "#9b59b6", "#2ecc71"],
        borderWidth: 1,
      },
    ],
  };

  // Popularité moyenne (comparaison)
  const popularityData = {
    labels: compareUsers,
    datasets: [
      {
        label: "Popularité moyenne des titres",
        data: comparePopularity,
        backgroundColor: ["#1DB954", "#3498db", "#e74c3c"],
      },
    ],
  };

  // Genres comparés (stacked)
  const comparegenreLabels = compareUsers;
  const genreDatasets = Object.keys(compareGenres).map((genre, i) => ({
    label: genre,
    data: compareGenres[genre],
    backgroundColor: ["#1DB954", "#e74c3c", "#3498db", "#f1c40f", "#9b59b6"][i % 5],
  }));

  const stackedGenreData = {
    labels: comparegenreLabels,
    datasets: genreDatasets,
  };

  // Genres basés sur topArtists
  const genreCount: Record<string, number> = {};
  topArtists.forEach((a) => {
    a.genres?.forEach((g) => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  });
  const genreLabels = Object.keys(genreCount).slice(0, 6);
  const genreValues = Object.values(genreCount).slice(0, 6);
  const genreData = {
    labels: genreLabels,
    datasets: [
      {
        data: genreValues,
        backgroundColor: ["#1DB954", "#ff4d6d", "#4da6ff", "#f1c40f", "#9b59b6", "#95a5a6"],
        borderWidth: 0,
      },
    ],
  };

  // Heures d’écoute (recent plays)
  const hourData: { count: number; tracks: string[] }[] = Array.from({ length: 24 }, () => ({ count: 0, tracks: [] }));

  recentPlays.forEach((play) => {
    const hour = new Date(play.played_at).getHours();
    const trackName = play.track?.name || "Titre inconnu";
    const artists = play.track?.artists?.map((a: any) => a.name).join(", ") || "Artiste inconnu";
    hourData[hour].count++;
    hourData[hour].tracks.push(`${trackName} – ${artists}`);
  });

  // Helpers limites
  const nextLimit = (current: number) => (current === 5 ? 10 : current === 10 ? 30 : 30);
  const prevLimit = (current: number) => (current === 30 ? 10 : current === 10 ? 5 : 5);

  if (loading) {
    return (
      <div className="text-center my-5" style={{ color: "white", background: "#121212", minHeight: "100vh" }}>
        <Spinner animation="border" variant="success" />
        <p>Chargement des données Spotify...</p>
      </div>
    );
  }

  // STYLE GLOBAL DES CARDS
  const glassCardStyle = {
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f0f0f0",
  } as const;

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #121212 0%, #1e1e1e 100%)",
        minHeight: "100vh",
        color: "#f0f0f0",
        paddingBottom: "4rem",
        paddingTop: "6rem",
      }}
    >
      <Container fluid className="pt-4">
        <motion.h2
          className="mb-4 text-center fw-bold"
          style={{ fontSize: "2rem", color: "#1DB954" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎵 Spotify Dashboard
        </motion.h2>

        {/* Onglets */}
        <div className="d-flex justify-content-center mb-4">
          <Button
            variant={activeTab === "dashboard" ? "success" : "outline-success"}
            className="mx-2 rounded-pill"
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant={activeTab === "stats" ? "success" : "outline-success"}
            className="mx-2 rounded-pill"
            onClick={() => setActiveTab("stats")}
          >
            Stats
          </Button>
        </div>

        {/* --- DASHBOARD --- */}
        {activeTab === "dashboard" && (
          <>
            {/* Profil utilisateur */}
            {profile && (
              <Card className="mb-4 p-3" style={glassCardStyle}>
                <Row className="align-items-center">
                  <Col xs="auto">
                    <Image
                      src={profile.images?.[0]?.url || "https://via.placeholder.com/80"}
                      roundedCircle
                      width={60}
                      height={60}
                      style={{
                        objectFit: "cover",
                        aspectRatio: "1/1",
                        border: "2px solid #1DB954",
                      }}
                    />
                  </Col>
                  <Col>
                    <h5 className="fw-bold mb-1 text-truncate">{profile.display_name}</h5>
                    <p className="mb-0 small text-truncate" style={{ color: "#aaa" }}>
                      {profile.email}
                    </p>
                    <small style={{ color: "#555" }}>ID: {profile.id}</small>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Top artistes */}
            <Card className="mb-4 p-3" style={glassCardStyle}>
              <h4 className="fw-bold text-success mb-3">🎤 Top artistes</h4>
              <Row>
                {topArtists.slice(0, artistLimit).map((artist) => (
                  <Col key={artist.id} xs={6} md={4} lg={3} className="mb-3 text-center">
                    <motion.div
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0px 4px 15px rgba(29,185,84,0.6)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      style={{ borderRadius: "15px", padding: "10px" }}
                    >
                      <Image
                        src={artist.images?.[0]?.url || "https://via.placeholder.com/150"}
                        roundedCircle
                        fluid
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                      />
                      <p className="mt-2 mb-0 fw-bold">{artist.name}</p>
                    </motion.div>
                  </Col>
                ))}
              </Row>

              <div className="d-flex justify-content-center">
                <Button
                  size="sm"
                  variant="outline-light"
                  className="mx-1 rounded-pill"
                  onClick={() => setArtistLimit(prevLimit(artistLimit))}
                >
                  -
                </Button>
                <Button
                  size="sm"
                  variant="outline-light"
                  className="mx-1 rounded-pill"
                  onClick={() => setArtistLimit(nextLimit(artistLimit))}
                >
                  +
                </Button>
              </div>
            </Card>

            {/* Top tracks */}
            <Card className="mb-4 p-3" style={glassCardStyle}>
              <h4 className="fw-bold text-success mb-3">🎶 Top titres</h4>
              <Row>
                {topTracks.slice(0, trackLimit).map((track) => {
                  return (
                    <Col key={track.id} xs={6} md={4} lg={3} className="mb-3 text-center">
                      <motion.div
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0px 4px 15px rgba(29,185,84,0.6)",
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                        style={{ borderRadius: "15px", padding: "10px" }}
                      >
                        <Image
                          src={track.album.images?.[0]?.url || "https://via.placeholder.com/150"}
                          rounded
                          fluid
                          style={{ borderRadius: "15px" }}
                        />
                        <p className="mt-2 mb-0 fw-bold">{track.name}</p>
                        <small className="text-muted">
                          {track.artists.map((a) => a.name).join(", ")}
                        </small>

                        {/* Bouton Play/Pause */}
                        {track.preview_url ? (
                          <Button
                            variant={currentPreview === track.preview_url ? "danger" : "success"}
                            size="sm"
                            className="mt-2 rounded-pill"
                            onClick={() => handlePlayPreview(track.preview_url!)}
                          >
                            {currentPreview === track.preview_url ? "⏸ Pause" : "▶️ Play"}
                          </Button>
                        ) : (
                          <small className="text-muted d-block mt-2">
                            Aucun extrait disponible
                          </small>
                        )}
                      </motion.div>
                    </Col>
                  );
                })}
              </Row>
              <div className="d-flex justify-content-center">
                <Button
                  size="sm"
                  variant="outline-light"
                  className="mx-1 rounded-pill"
                  onClick={() => setTrackLimit(prevLimit(trackLimit))}
                >
                  -
                </Button>
                <Button
                  size="sm"
                  variant="outline-light"
                  className="mx-1 rounded-pill"
                  onClick={() => setTrackLimit(nextLimit(trackLimit))}
                >
                  +
                </Button>
              </div>
            </Card>

            {/* Playlists */}
            <Card className="mb-4 p-3" style={glassCardStyle}>
              <h4 className="fw-bold text-success mb-3">📂 Playlists</h4>
              <Row>
                {playlists.slice(0, 6).map((pl) => (
                  <Col key={pl.id} xs={6} md={4} lg={3} className="mb-3 text-center">
                    <motion.div
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0px 4px 15px rgba(29,185,84,0.6)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      style={{ borderRadius: "15px", padding: "10px" }}
                    >
                      <Image
                        src={pl.images?.[0]?.url || "https://via.placeholder.com/150"}
                        rounded
                        fluid
                        style={{ borderRadius: "15px" }}
                      />
                      <p className="mt-2 fw-bold">{pl.name}</p>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* Recherche */}
            <Card className="mb-4 p-3" style={glassCardStyle}>
              <h4 className="fw-bold text-success mb-3">🔎 Recherche</h4>
              <Form onSubmit={handleSearch} className="d-flex mb-3">
                <Form.Control
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un titre"
                  className="me-2"
                />
                <Button type="submit" variant="success" className="rounded-pill">
                  Rechercher
                </Button>
              </Form>
              <Row>
                {searchResults.map((track) => (
                  <Col key={track.id} xs={6} md={4} lg={3} className="mb-3 text-center">
                    <motion.div
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0px 4px 15px rgba(29,185,84,0.6)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      style={{
                        borderRadius: "15px",
                        padding: "10px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                      }}
                    >
                      <Image
                        src={track.album.images?.[0]?.url || "https://via.placeholder.com/150"}
                        rounded
                        fluid
                        style={{ borderRadius: "15px" }}
                      />
                      <p className="mt-2 mb-0 fw-bold">{track.name}</p>
                      <small className="text-muted">
                        {track.artists.map((a: any) => a.name).join(", ")}
                      </small>

                      {/* Bouton Play/Pause */}
                      {track.preview_url ? (
                        <Button
                          variant={currentPreview === track.preview_url ? "danger" : "success"}
                          size="sm"
                          className="mt-2 rounded-pill"
                          onClick={() => handlePlayPreview(track.preview_url)}
                        >
                          {currentPreview === track.preview_url ? "⏸ Pause" : "▶️ Play"}
                        </Button>
                      ) : (
                        <small className="text-muted d-block mt-2">
                          Aucun extrait disponible
                        </small>
                      )}
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Card>
          </>
        )}

        {/* --- STATS --- */}
        {activeTab === "stats" && (
          <>
            <Row>
              <Col md={6}>
                <Card className="p-4 mb-4" style={glassCardStyle}>
                  <h4 className="fw-bold text-success mb-3">📊 Genres musicaux</h4>
                  <div style={{ maxWidth: "360px", margin: "0 auto" }}>
                    <Pie data={genreData} />
                  </div>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="p-4 mb-4" style={glassCardStyle}>
                  <h4 className="fw-bold text-success mb-3">⏰ Heures d'écoute</h4>
                  <Line
                    data={{
                      labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
                      datasets: [
                        {
                          label: "Titres joués",
                          data: hourData.map((h) => h.count),
                          fill: true,
                          borderColor: "#1DB954",
                          backgroundColor: "rgba(29,185,84,0.2)",
                        },
                      ],
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Card className="p-4 mb-4" style={glassCardStyle}>
                  <h4 className="fw-bold text-success mb-3">🎯 Répartition par popularité</h4>
                  <div style={{ maxWidth: "360px", margin: "0 auto" }}>
                    <Pie
                      data={{
                        labels: ["Très populaires (70+)", "Moyens (40-69)", "Confidentiels (<40)"],
                        datasets: [
                          {
                            data: [
                              topTracks.filter((t) => t.popularity >= 70).length,
                              topTracks.filter((t) => t.popularity >= 40 && t.popularity < 70).length,
                              topTracks.filter((t) => t.popularity < 40).length,
                            ],
                            backgroundColor: ["#1DB954", "#f1c40f", "#e74c3c"],
                          },
                        ],
                      }}
                    />
                  </div>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="p-4 mb-4" style={glassCardStyle}>
                  <h4 className="fw-bold text-success mb-3">📅 Écoutes par jour (7 derniers jours)</h4>
                  <Line
                    data={{
                      labels: Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        return d.toLocaleDateString("fr-FR", { weekday: "short" });
                      }),
                      datasets: [
                        {
                          label: "Titres joués",
                          data: Array.from({ length: 7 }, (_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() - (6 - i));
                            const dayKey = d.toISOString().split("T")[0];
                            return recentPlays.filter(
                              (p) => new Date(p.played_at).toISOString().split("T")[0] === dayKey
                            ).length;
                          }),
                          fill: true,
                          borderColor: "#1DB954",
                          backgroundColor: "rgba(29,185,84,0.2)",
                        },
                      ],
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Card className="p-4 mb-4" style={glassCardStyle}>
                  <h4 className="fw-bold text-success mb-3">⏱️ Durée moyenne des titres</h4>
                  <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                    <Bar
                      data={{
                        labels: ["Top Tracks", "Écoutes Récentes"],
                        datasets: [
                          {
                            label: "Durée moyenne (minutes)",
                            data: [
                              topTracks.length > 0
                                ? topTracks.reduce((a, b) => a + (b as any).duration_ms, 0) / topTracks.length / 60000
                                : 0,
                              recentPlays.length > 0
                                ? recentPlays.reduce((a, b) => a + b.track.duration_ms, 0) / recentPlays.length / 60000
                                : 0,
                            ],
                            backgroundColor: ["#1DB954", "#3498db"],
                          },
                        ],
                      }}
                      options={{
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: { color: "#f0f0f0" },
                          },
                          x: {
                            ticks: { color: "#f0f0f0" },
                          },
                        },
                        plugins: {
                          legend: { labels: { color: "#f0f0f0" } },
                        },
                      }}
                    />
                  </div>
                </Card>
              </Col>
{monthlyStats.length > 0 && (
  <Card className="p-4 mb-4" style={glassCardStyle}>
    <h4 className="fw-bold text-success mb-3">📆 Écoutes mensuelles</h4>
    <Bar
      data={{
        labels: monthlyStats.map((s) => s.label),
        datasets: [
          {
            label: "Nombre d'écoutes",
            data: monthlyStats.map((s) => s.value),
            backgroundColor: "#1DB954",
          },
        ],
      }}
    />
  </Card>
)}
              <Col md={6}>
                <Card className="p-4 mb-4" style={glassCardStyle}>
                  <h4 className="fw-bold text-success mb-3">🏅 Mes Badges</h4>
                  <Row>
                    {ALL_BADGES.map((badge) => {
                      const unlocked = badges.includes(badge.label);
                      return (
                        <Col key={badge.key} xs={6} md={4} className="mb-3 text-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="p-3 rounded"
                            style={{
                              cursor: "pointer",
                              border: unlocked ? "2px solid #1DB954" : "2px solid #333",
                              background: unlocked ? "rgba(29,185,84,0.2)" : "rgba(255,255,255,0.05)",
                              color: unlocked ? "#fff" : "#555",
                              boxShadow: unlocked ? "0px 0px 20px rgba(29,185,84,0.8)" : "none",
                              transition: "all 0.3s ease-in-out",
                            }}
                            onClick={() => alert(`${badge.label} : ${badge.description}`)}
                          >
                            <div style={{ fontSize: "2rem" }}>{badge.icon}</div>
                            <p className="fw-bold mt-2">{badge.label}</p>
                          </motion.div>
                        </Col>
                      );
                    })}
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* Comparaisons */}
            <Row>
              <Col md={6}>
                <Card className="p-4 mb-4" style={glassCardStyle}>
                  <h4 className="fw-bold text-success mb-3">👥 Popularité moyenne (comparaison)</h4>
                  <Bar data={popularityData} />
                </Card>
              </Col>
              <Col md={6}>
                <Card className="p-4 mb-4" style={glassCardStyle}>
                  <h4 className="fw-bold text-success mb-3">🎼 Genres par utilisateur (stacked)</h4>
                  <Bar
                    data={stackedGenreData}
                    options={{ responsive: true, plugins: { legend: { position: "top" as const } }, scales: { x: { stacked: true }, y: { stacked: true } } }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Devices */}
            <Row>
              <Col md={6}>
                <Card className="p-4 mb-4" style={glassCardStyle}>
                  <h4 className="fw-bold text-success mb-3">🖥️ Appareils utilisés</h4>
                  <div style={{ maxWidth: "360px", margin: "0 auto" }}>
                    <Pie data={deviceData} />
                  </div>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="p-4 mb-4" style={glassCardStyle}>
                  <h4 className="fw-bold text-success mb-3">🧭 Radar (exemple visuel)</h4>
                  <Radar
                    data={{
                      labels: ["Découverte", "Énergie", "Dansabilité", "Acoustique", "Instrumental", "Live"],
                      datasets: [
                        {
                          label: "Moi",
                          data: [65, 59, 90, 81, 56, 55],
                          backgroundColor: "rgba(29,185,84,0.2)",
                          borderColor: "#1DB954",
                        },
                        {
                          label: "Moyenne",
                          data: [28, 48, 40, 19, 96, 27],
                          backgroundColor: "rgba(52,152,219,0.2)",
                          borderColor: "#3498db",
                        },
                      ],
                    }}
                    options={{
                      scales: { r: { angleLines: { color: "#555" }, grid: { color: "#333" }, pointLabels: { color: "#ddd" } } },
                      plugins: { legend: { labels: { color: "#f0f0f0" } } },
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};
