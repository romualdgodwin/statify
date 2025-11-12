// client/src/pages/Users.tsx
import { useEffect, useState, useMemo } from "react";
import api from "../services/api";

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

  // 🎨 Styles Spotify
  const styles = useMemo(
    () => ({
      page: {
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: "80vh",
        padding: "1rem",
        color: "#f0f0f0",
      },
      card: {
        width: "100%",
        maxWidth: "1100px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "1.25rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      },
      headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.75rem",
      },
      title: {
        margin: 0,
        fontSize: "1.5rem",
        fontWeight: 800,
        letterSpacing: "0.3px",
        color: "#1DB954",
        textShadow: "0 0 18px rgba(29,185,84,0.35)",
      },
      refreshBtn: {
        border: "1px solid #1DB954",
        background: "transparent",
        color: "#1DB954",
        padding: "8px 14px",
        borderRadius: 999,
        cursor: "pointer",
        fontWeight: 600,
      },
      tableWrap: { overflowX: "auto" as const, marginTop: "0.5rem" },
      table: {
        width: "100%",
        borderCollapse: "separate" as const,
        borderSpacing: 0,
        minWidth: 720,
        background: "#121212",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      },
      th: {
        textAlign: "left" as const,
        padding: "12px 14px",
        fontSize: 13,
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
        background:
          "linear-gradient(180deg, rgba(29,185,84,0.18) 0%, rgba(29,185,84,0.10) 100%)",
        color: "#e6ffe6",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        position: "sticky" as const,
        top: 0,
        zIndex: 1,
      },
      td: {
        padding: "12px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        fontSize: 14,
        color: "#e9e9e9",
      },
      row: {
        background: "rgba(255,255,255,0.02)",
      },
      rowAlt: {
        background: "rgba(255,255,255,0.035)",
      },
      badge: (isAdmin: boolean) => ({
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.02em",
        background: isAdmin ? "rgba(29,185,84,0.22)" : "rgba(255,255,255,0.08)",
        color: isAdmin ? "#baffd1" : "#d6d6d6",
        border: isAdmin ? "1px solid rgba(29,185,84,0.5)" : "1px solid rgba(255,255,255,0.14)",
      }),
      btnGroup: { display: "flex", gap: 8, flexWrap: "wrap" as const },
      btn: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.06)",
        color: "#f1f1f1",
        cursor: "pointer",
        fontWeight: 600,
      },
      btnPrimary: {
        border: "1px solid #1DB954",
        background: "rgba(29,185,84,0.15)",
        color: "#eafff3",
      },
      btnDanger: {
        border: "1px solid rgba(231,76,60,0.6)",
        background: "rgba(231,76,60,0.15)",
        color: "#ffd6d2",
      },
      meta: { fontSize: 12, opacity: 0.8 },
      alert: (type: "error" | "info") => ({
        padding: "10px 12px",
        borderRadius: 8,
        marginBottom: "10px",
        border:
          type === "error"
            ? "1px solid rgba(231,76,60,0.5)"
            : "1px solid rgba(29,185,84,0.4)",
        background:
          type === "error"
            ? "rgba(231,76,60,0.12)"
            : "rgba(29,185,84,0.12)",
        color: type === "error" ? "#ffd6d2" : "#baffd1",
      }),
      empty: {
        textAlign: "center" as const,
        padding: "24px",
        color: "#bdbdbd",
      },
      idPill: {
        display: "inline-block",
        fontVariantNumeric: "tabular-nums" as const,
        padding: "2px 8px",
        borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        color: "#dcdcdc",
      },
      date: { color: "#cfcfcf", fontVariantNumeric: "tabular-nums" as const },
    }),
    []
  );

  const fetchUsers = () => {
    setLoading(true);
    setError("");
    api
      .get<User[]>("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("❌ Erreur chargement utilisateurs:", err);
        setError("Impossible de charger les utilisateurs.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      api
        .delete(`/users/${id}`)
        .then(() => setUsers((prev) => prev.filter((u) => u.id !== id)))
        .catch((err) => {
          console.error("❌ Erreur suppression:", err);
          setError("Suppression échouée (réservée aux admins).");
        });
    }
  };

  const handleUpdate = (id: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    api
      .put(`/users/${id}`, { role: newRole })
      .then(() => fetchUsers())
      .catch((err) => {
        console.error("❌ Erreur update:", err);
        setError("Mise à jour échouée (réservée aux admins).");
      });
  };

  return (
    <div style={styles.page} aria-live="polite">
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>👥 Liste des utilisateurs</h1>
          <button
            type="button"
            onClick={fetchUsers}
            style={styles.refreshBtn}
            aria-label="Rafraîchir la liste des utilisateurs"
            title="Rafraîchir"
          >
            🔄 Rafraîchir
          </button>
        </div>

        {error && <div style={styles.alert("error")}>{error}</div>}
        {loading && <div style={styles.alert("info")}>Chargement…</div>}

        {!loading && users.length === 0 ? (
          <div style={styles.empty}>Aucun utilisateur trouvé.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table} role="table" aria-label="Tableau des utilisateurs">
              <thead>
                <tr>
                  <th style={styles.th} scope="col">ID</th>
                  <th style={styles.th} scope="col">Email</th>
                  <th style={styles.th} scope="col">Rôle</th>
                  <th style={styles.th} scope="col">Créé le</th>
                  <th style={styles.th} scope="col">Mis à jour le</th>
                  <th style={styles.th} scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rowStyle = i % 2 === 0 ? styles.row : styles.rowAlt;
                  return (
                    <tr key={u.id} style={rowStyle}>
                      <td style={styles.td}>
                        <span style={styles.idPill}>{u.id}</span>
                      </td>
                      <td style={styles.td}>
                        <span>{u.email}</span>
                      </td>
                      <td style={styles.td}>
                        <span aria-label={`Rôle ${u.role}`} style={styles.badge(u.role === "admin")}>
                          {u.role}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <time
                          title={u.createdAt ? new Date(u.createdAt).toISOString() : ""}
                          style={styles.date}
                        >
                          {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                        </time>
                      </td>
                      <td style={styles.td}>
                        <time
                          title={u.updatedAt ? new Date(u.updatedAt).toISOString() : ""}
                          style={styles.date}
                        >
                          {u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "-"}
                        </time>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.btnGroup}>
                          <button
                            type="button"
                            onClick={() => handleUpdate(u.id, u.role)}
                            style={{ ...styles.btn, ...styles.btnPrimary }}
                            aria-label={`Basculer le rôle de ${u.email}`}
                            title="Modifier rôle"
                          >
                            Modifier rôle
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            style={{ ...styles.btn, ...styles.btnDanger }}
                            aria-label={`Supprimer ${u.email}`}
                            title="Supprimer l’utilisateur"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p style={{ ...styles.meta, marginTop: 8 }}>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
