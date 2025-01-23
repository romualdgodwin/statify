import { useEffect, useState } from "react";
import axios from "axios";

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = (await axios.get("http://localhost:3000/users")).data;
        setUsers(data);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
  };
};
