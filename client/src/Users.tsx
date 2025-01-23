import axios from "axios";
import { Page } from "./Page";
import { useEffect, useState } from "react";

export const Users = () => {
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

  return (
    <Page title="Users">
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <ul>
          {users.map((user: any) => (
            <li key={user.id}>{user.login}</li>
          ))}
        </ul>
      )}
    </Page>
  );
};
