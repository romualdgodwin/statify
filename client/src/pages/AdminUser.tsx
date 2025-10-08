import { useEffect, useState } from "react";
import axios from "axios";

type User = {
  id: number;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
};

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    axios
      .get("http://localhost:3000/users/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Erreur lors du chargement :", err);
        setError("Impossible de charger les utilisateurs");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Créer un utilisateur
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .post(
        "http://localhost:3000/users",
        { email, password, role },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      .then(() => {
        setEmail("");
        setPassword("");
        setRole("user");
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
    axios
      .delete(`http://localhost:3000/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => fetchUsers())
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
    axios
      .put(
        `http://localhost:3000/users/${id}`,
        { email: editEmail, role: editRole, password: editPassword || undefined },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      .then(() => {
        setEditingUserId(null);
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
