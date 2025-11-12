import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import debounce from "lodash.debounce";

type Badge = {
  id: number;
  label: string;
  description: string;
  icon: string;
  isCustom: boolean;
};

export default function AdminBadges() {
  const { token } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newBadge, setNewBadge] = useState({ label: "", description: "", icon: "" });

  // Charger les badges
  useEffect(() => {
    if (!token) return;
    const fetchBadges = async () => {
      try {
        const res = await api.get("/admin/badges");
        // adminController renvoie { badges }
        setBadges(res.data.badges || []);
      } catch (err) {
        console.error("❌ Erreur chargement badges:", err);
        setError("Impossible de charger les badges.");
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [token]);

  // Ajouter un badge
  const handleAddBadge = async () => {
    if (!newBadge.label || !newBadge.description) {
      alert("Remplis au moins le label et la description !");
      return;
    }
    try {
      const res = await api.post("/admin/badges", { ...newBadge, isCustom: true });
      setBadges([...badges, res.data]);
      setNewBadge({ label: "", description: "", icon: "" });
    } catch (err) {
      console.error("❌ Erreur ajout badge:", err);
    }
  };

  // Supprimer un badge
  const handleDeleteBadge = async (id: number) => {
    if (!window.confirm("Supprimer ce badge ?")) return;
    try {
      await api.delete(`/admin/badges/${id}`);
      setBadges(badges.filter((b) => b.id !== id));
    } catch (err) {
      console.error("❌ Erreur suppression badge:", err);
    }
  };

  // Debounce update
  const debouncedUpdate = debounce(async (id: number, field: keyof Badge, value: string | boolean) => {
    try {
      await api.put(`/admin/badges/${id}`, { [field]: value });
    } catch (err) {
      console.error("❌ Erreur update badge:", err);
    }
  }, 500);

  // Modifier un badge inline
  const handleUpdateBadge = (id: number, field: keyof Badge, value: string | boolean) => {
    const updated = badges.map((b) => (b.id === id ? { ...b, [field]: value } : b));
    setBadges(updated);
    debouncedUpdate(id, field, value);
  };

  if (loading) return <p className="text-white">Chargement des badges...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-6 text-white">
      <h2 className="text-2xl font-bold mb-4 text-white">🏅 Gestion des badges</h2>


      {/* Formulaire ajout */}
      <div className="bg-neutral-900 p-4 rounded-xl mb-6">
        <h3 className="font-semibold mb-2">➕ Ajouter un badge</h3>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Label"
            value={newBadge.label}
            onChange={(e) => setNewBadge({ ...newBadge, label: e.target.value })}
            className="px-2 py-1 rounded bg-neutral-800 flex-1"
          />
          <input
            type="text"
            placeholder="Description"
            value={newBadge.description}
            onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
            className="px-2 py-1 rounded bg-neutral-800 flex-1"
          />
          <input
            type="text"
            placeholder="Icône (ex: 🎧)"
            value={newBadge.icon}
            onChange={(e) => setNewBadge({ ...newBadge, icon: e.target.value })}
            className="px-2 py-1 rounded bg-neutral-800 w-24 text-center"
          />
          <button
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700"
            onClick={handleAddBadge}
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Liste des badges */}
      <table className="w-full text-sm bg-neutral-900 rounded-xl overflow-hidden">
        <thead className="bg-neutral-800">
          <tr>
            <th>ID</th>
            <th>Icône</th>
            <th>Label</th>
            <th>Description</th>
            <th>Custom</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {badges.map((b, i) => (
            <tr key={b.id} className={i % 2 === 0 ? "bg-neutral-900" : "bg-neutral-800"}>
              <td className="px-2 py-1">{b.id}</td>
              <td className="px-2 py-1 text-center">
                <input
                  type="text"
                  value={b.icon}
                  onChange={(e) => handleUpdateBadge(b.id, "icon", e.target.value)}
                  className="bg-neutral-800 px-1 rounded text-center w-12"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={b.label}
                  onChange={(e) => handleUpdateBadge(b.id, "label", e.target.value)}
                  className="bg-neutral-800 px-1 rounded w-full"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={b.description}
                  onChange={(e) => handleUpdateBadge(b.id, "description", e.target.value)}
                  className="bg-neutral-800 px-1 rounded w-full"
                />
              </td>
              <td className="px-2 py-1 text-center">{b.isCustom ? "✅" : "❌"}</td>
              <td className="px-2 py-1">
                <button
                  onClick={() => handleDeleteBadge(b.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
