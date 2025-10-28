import { useEffect, useState } from "react";
import api from "../services/api"; // ✅ utilise ton axios centralisé

export type User = {
  id: number;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
};

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get<User[]>("/users"); // ✅ plus besoin du host
        setUsers(data);
        setError(undefined);
      } catch (err: any) {
        console.error("❌ Erreur récupération utilisateurs:", err);
        setError(err.response?.data?.message || "Erreur lors de la récupération des utilisateurs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
  };
};
