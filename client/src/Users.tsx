import axios from "axios";
import { Page } from "./Page";
import { useEffect, useState } from "react";

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = (await axios.get("http://localhost:3000/users")).data;
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <Page title="Users">
      <ul>
        {users.map((user: any) => (
          <li key={user.id}>{user.login}</li>
        ))}
      </ul>
    </Page>
  );
};
