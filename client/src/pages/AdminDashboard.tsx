import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from "chart.js";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

type User = {
  id: number;
  email: string;
  role: string;
};

type ExpiredToken = {
  id: number;
  email: string;
  spotifyTokenExpiry: string;
};

type LeaderboardUser = {
  id: number;
  email: string;
  totalPlays: number;
  uniqueArtists: number;
};

export default function AdminDashboard() {
  const { token } = useAuth(); 
  const [usersStats, setUsersStats] = useState<{ totalUsers: number; activeUsers: number } | null>(null);
  const [totalPlays, setTotalPlays] = useState<number>(0);
  const [badgeCount, setBadgeCount] = useState<Record<string, number>>({});
  const [expiredTokens, setExpiredTokens] = useState<ExpiredToken[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [u, p, b, t, list, lb] = await Promise.allSettled([
          api.get("/admin/stats/users"),
          api.get("/admin/stats/plays"),
          api.get("/admin/stats/badges"),
          api.get("/admin/tokens/expired"),
          api.get("/users"),
          api.get("/users/leaderboard")
        ]);

        if (u.status === "fulfilled") setUsersStats(u.value.data);
        if (p.status === "fulfilled") setTotalPlays(p.value.data.totalPlays);
        if (b.status === "fulfilled") setBadgeCount(b.value.data.badgeCount || {});
        if (t.status === "fulfilled") setExpiredTokens(t.value.data.expired || []);
        if (list.status === "fulfilled") setUsers(list.value.data.users || list.value.data || []);
        if (lb.status === "fulfilled") {
          // On limite au Top 10
          setLeaderboard((lb.value.data.leaderboard || []).slice(0, 10));
        }

      } catch (err) {
        console.error("❌ Erreur récupération stats:", err);
        setError("Impossible de charger les statistiques admin.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  const usersData = {
    labels: ["Total users", "Active (30j)"],
    datasets: [{
      label: "Users",
      data: usersStats ? [usersStats.totalUsers, usersStats.activeUsers] : [0, 0],
      backgroundColor: ["#1DB954", "#3498db"],
    }],
  };

  const badgesPie = {
    labels: Object.keys(badgeCount),
    datasets: [{
      data: Object.values(badgeCount),
      backgroundColor: ["#1DB954", "#f1c40f", "#e74c3c", "#9b59b6", "#3498db", "#2ecc71"],
    }],
  };

  const leaderboardData = {
    labels: leaderboard.map(l => l.email),
    datasets: [{
      label: "Total Plays",
      data: leaderboard.map(l => l.totalPlays),
      backgroundColor: "#1DB954"
    }]
  };

  const handleRefreshUser = async (userId: number) => {
    try {
      await api.post(`/admin/refresh/${userId}`);
      alert("🔄 Données Spotify rafraîchies !");
    } catch (err) {
      console.error("❌ Erreur rafraîchissement :", err);
      alert("Impossible de rafraîchir l’utilisateur.");
    }
  };

  if (!token) {
    return <p className="text-center mt-6 text-white">⏳ En attente d’authentification...</p>;
  }

  if (loading) {
    return <p className="text-center mt-6 text-white">Chargement du dashboard...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-6 text-white">
      <h2 className="text-2xl font-bold mb-4">📊 Admin Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Utilisateurs */}
        <div className="bg-neutral-900 p-4 rounded-xl">
          <h3 className="font-semibold mb-2">👥 Utilisateurs</h3>
          <Bar data={usersData} />
          <p className="mt-3 opacity-80">Total plays: <b>{totalPlays}</b></p>
        </div>

        {/* Badges */}
        <div className="bg-neutral-900 p-4 rounded-xl">
          <h3 className="font-semibold mb-2">🏅 Répartition des Badges</h3>
          {Object.keys(badgeCount).length === 0 ? (
            <p className="opacity-70">Aucun badge attribué</p>
          ) : (
            <Pie data={badgesPie} />
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-neutral-900 p-4 rounded-xl md:col-span-2">
          <h3 className="font-semibold mb-3">🏆 Leaderboard (Top 10)</h3>
          {leaderboard.length === 0 ? (
            <p className="opacity-70">Aucune donnée pour le leaderboard</p>
          ) : (
            <>
              <Bar data={leaderboardData} />
              <table className="w-full text-sm mt-4 border border-gray-700 rounded">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Total Plays</th>
                    <th className="px-3 py-2">Unique Artists</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((u, i) => (
                    <tr key={u.id} className={i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">{u.totalPlays}</td>
                      <td className="px-3 py-2">{u.uniqueArtists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Tokens expirés */}
        <div className="bg-neutral-900 p-4 rounded-xl md:col-span-2">
          <h3 className="font-semibold mb-3">⛔ Tokens Spotify expirés</h3>
          {expiredTokens.length === 0 ? (
            <p className="opacity-70">Aucun token expiré ✅</p>
          ) : (
            <ul className="list-disc pl-6">
              {expiredTokens.map((u) => (
                <li key={u.id}>{u.email} - {u.spotifyTokenExpiry}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Rafraîchir */}
        <div className="bg-neutral-900 p-4 rounded-xl md:col-span-2">
          <h3 className="font-semibold mb-3">🔄 Rafraîchir un utilisateur</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th>Email</th><th>Rôle</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleRefreshUser(u.id)}
                    >
                      🔄 Rafraîchir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
