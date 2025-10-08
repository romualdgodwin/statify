import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext"; // ✅ pour récupérer le token

type User = {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth(); // ✅ on récupère le token depuis le contexte

  // Charger les utilisateurs
  const fetchUsers = () => {
    setLoading(true);
    axios
      .get("http://localhost:3000/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("❌ Erreur lors du chargement des utilisateurs :", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Supprimer un utilisateur
  const handleDelete = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      axios
        .delete(`http://localhost:3000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }, // ✅ envoie du token
        })
        .then(() => {
          setUsers(users.filter((u) => u.id !== id));
        })
        .catch((err) => {
          console.error("❌ Erreur lors de la suppression :", err);
          alert("Suppression échouée (réservé aux admins).");
        });
    }
  };

  // Modifier un utilisateur (changer rôle admin <-> user)
  const handleUpdate = (id: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    axios
      .put(
        `http://localhost:3000/users/${id}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } } // ✅ token requis
      )
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        console.error("❌ Erreur lors de la mise à jour :", err);
        alert("Mise à jour échouée (réservée aux admins).");
      });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Liste des utilisateurs</h1>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">Aucun utilisateur trouvé</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Créé le</th>
                <th>Mis à jour le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === "admin" ? "badge-primary" : "badge-secondary"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                  <td>{new Date(u.updatedAt).toLocaleString()}</td>
                  <td className="space-x-2">
                    <button
                      className="btn btn-sm btn-outline btn-info"
                      onClick={() => handleUpdate(u.id, u.role)}
                    >
                      Modifier rôle
                    </button>
                    <button
                      className="btn btn-sm btn-outline btn-error"
                      onClick={() => handleDelete(u.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
