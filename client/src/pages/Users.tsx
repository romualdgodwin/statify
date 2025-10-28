import { useEffect, useState } from "react";
import api from "../services/api"; // ✅ utiliser l’axios centralisé

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

  const fetchUsers = () => {
    setLoading(true);
    setError("");
    api
      .get<User[]>("/users") // ✅ plus besoin de headers, api.ts gère le token
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

  const handleDelete = (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      api
        .delete(`/users/${id}`) // ✅ pas besoin de headers ici non plus
        .then(() => {
          setUsers(users.filter((u) => u.id !== id));
        })
        .catch((err) => {
          console.error("❌ Erreur suppression:", err);
          setError("Suppression échouée (réservée aux admins).");
        });
    }
  };

  const handleUpdate = (id: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    api
      .put(`/users/${id}`, { role: newRole }) // ✅ token auto ajouté
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        console.error("❌ Erreur update:", err);
        setError("Mise à jour échouée (réservée aux admins).");
      });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: "80vh",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <h1 className="text-center mb-4">Liste des utilisateurs</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : users.length === 0 ? (
          <p className="text-center">Aucun utilisateur trouvé.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table table-striped table-bordered text-center">
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
          </div>
        )}
      </div>
    </div>
  );
};
