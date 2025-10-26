import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from "chart.js";
import api from "../services/api";  // ✅ on importe l’api centralisée

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminDashboard() {
  const [usersStats, setUsersStats] = useState<{ totalUsers: number; activeUsers: number } | null>(null);
  const [totalPlays, setTotalPlays] = useState<number>(0);
  const [badgeCount, setBadgeCount] = useState<Record<string, number>>({});
  const [expiredTokens, setExpiredTokens] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [u, p, b, t, list] = await Promise.all([
        api.get("/admin/stats/users"),
        api.get("/admin/stats/plays"),
        api.get("/admin/stats/badges"),
        api.get("/admin/tokens/expired"),
        api.get("/users")
      ]);
      setUsersStats(u.data);
      setTotalPlays(p.data.totalPlays);
      setBadgeCount(b.data.badgeCount || {});
      setExpiredTokens(t.data.expired || []);
      setUsers(list.data.users || list.data || []);
    };
    fetchAll().catch(console.error);
  }, []);

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

  const handleRefreshUser = async (userId: number) => {
    await api.post(`/admin/refresh/${userId}`);
    alert("🔄 Données Spotify rafraîchies !");
  };

  return (
    <div className="container mx-auto px-4 py-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-900 p-4 rounded-xl">
          <h3 className="font-semibold mb-2">👥 Utilisateurs</h3>
          <Bar data={usersData} />
          <p className="mt-3 opacity-80">Total plays: <b>{totalPlays}</b></p>
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl">
          <h3 className="font-semibold mb-2">🏅 Badges</h3>
          <Pie data={badgesPie} />
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl md:col-span-2">
          <h3 className="font-semibold mb-3">⛔ Tokens Spotify expirés</h3>
          {expiredTokens.length === 0 ? (
            <p className="opacity-70">Aucun token expiré ✅</p>
          ) : (
            <ul>
              {expiredTokens.map((u) => (
                <li key={u.id}>{u.email} - {u.spotifyTokenExpiry}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl md:col-span-2">
          <h3 className="font-semibold mb-3">🔄 Rafraîchir un utilisateur</h3>
          <table className="w-full text-sm">
            <thead>
              <tr><th>Email</th><th>Rôle</th><th>Action</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
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
