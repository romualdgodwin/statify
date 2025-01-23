import { useEffect, useState } from "react";
import axios from "axios";

export type User = {
  id: number;
  login: string;
  password: string;
  role?: string;
};

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = (await axios.get("http://localhost:3000/users")).data;
        setUsers(data);
        setError(undefined);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
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
