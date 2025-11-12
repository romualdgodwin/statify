import { useEffect, useState } from "react";
import api from "../services/api"; 
import { useAuth } from "../contexts/AuthContext";

type User = {
  id: number;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
};

export const AdminUsers = () => {
  const { token } = useAuth(); 
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Création
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  // Édition
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [editPassword, setEditPassword] = useState("");

  // Charger les utilisateurs
  const fetchUsers = () => {
    setLoading(true);
    setError("");
    api
      .get("/users/all")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Erreur lors du chargement :", err);
        setError("Impossible de charger les utilisateurs");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Créer un utilisateur
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    api
      .post("/users", { email, password, role })
      .then(() => {
        setEmail("");
        setPassword("");
        setRole("user");
        setSuccess("✅ Utilisateur créé avec succès !");
        fetchUsers();
      })
      .catch((err) => {
        console.error("Erreur création :", err);
        setError("Impossible de créer l’utilisateur");
      });
  };

  // Supprimer un utilisateur
  const handleDelete = (id: number) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    setError("");
    setSuccess("");
    api
      .delete(`/users/${id}`)
      .then(() => {
        setSuccess("✅ Utilisateur supprimé !");
        fetchUsers();
      })
      .catch((err) => {
        console.error("Erreur suppression :", err);
        setError("Impossible de supprimer l’utilisateur");
      });
  };

  // Activer le mode édition
  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword("");
  };

  // Sauvegarder l’édition
  const handleUpdate = (id: number) => {
    setError("");
    setSuccess("");
    api
      .put(`/users/${id}`, {
        email: editEmail,
        role: editRole,
        password: editPassword || undefined,
      })
      .then(() => {
        setEditingUserId(null);
        setSuccess("✅ Utilisateur mis à jour !");
        fetchUsers();
      })
      .catch((err) => {
        console.error("Erreur update :", err);
        setError("Impossible de mettre à jour l’utilisateur");
      });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Gestion des utilisateurs 👥</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Formulaire création */}
      <form onSubmit={handleCreate} style={{ marginBottom: "2rem" }}>
        <h2>Créer un nouvel utilisateur</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">Utilisateur</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Créer</button>
      </form>

      {/* Liste des utilisateurs */}
      <h2>Liste des utilisateurs</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table border={1} cellPadding={8} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Créé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  {editingUserId === u.id ? (
                    <input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td>
                  {editingUserId === u.id ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                <td>
                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                </td>
                <td>
                  {editingUserId === u.id ? (
                    <>
                      <input
                        type="password"
                        placeholder="Nouveau mot de passe (optionnel)"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                      />
                      <button onClick={() => handleUpdate(u.id)}>💾 Sauvegarder</button>
                      <button onClick={() => setEditingUserId(null)}>❌ Annuler</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(u)}>✏️ Modifier</button>
                      <button onClick={() => handleDelete(u.id)}>🗑 Supprimer</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
