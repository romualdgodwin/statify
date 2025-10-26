import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext"; // ✅ récupère le token

type User = {
  id: number;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
};

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth(); // ✅ token depuis AuthContext

  // Charger les utilisateurs
  const fetchUsers = () => {
    setLoading(true);
    setError("");
    axios
      .get("http://localhost:3000/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("❌ Erreur chargement utilisateurs:", err);
        setError("Impossible de charger les utilisateurs.");
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
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      axios
        .delete(`http://localhost:3000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setUsers(users.filter((u) => u.id !== id));
        })
        .catch((err) => {
          console.error("❌ Erreur suppression:", err);
          setError("Suppression échouée (réservée aux admins).");
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
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        console.error("❌ Erreur update:", err);
        setError("Mise à jour échouée (réservée aux admins).");
      });
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Liste des utilisateurs</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Chargement...</p>
      ) : users.length === 0 ? (
        <p>Aucun utilisateur trouvé.</p>
      ) : (
        <table className="table table-striped table-bordered">
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
                      u.role === "admin" ? "bg-primary" : "bg-secondary"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                <td>{u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-info me-2"
                    onClick={() => handleUpdate(u.id, u.role)}
                  >
                    Modifier rôle
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(u.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
