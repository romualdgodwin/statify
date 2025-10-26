import { useEffect, useState } from "react";
import axios from "axios";

export type User = {
  id: number;
  email: string;  // ✅ au lieu de "login"
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
        const { data } = await axios.get<User[]>("http://localhost:3000/users");
        setUsers(data);
        setError(undefined);
      } catch (error: any) {
        console.error("Erreur récupération utilisateurs:", error);
        setError(error.message || "Erreur lors de la récupération des utilisateurs");
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
