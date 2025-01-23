import axios from "axios";
import { Page } from "./Page";
import { useEffect, useState } from "react";

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = (
        await axios.get("http://localhost:3000/users", {
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM3NjE5MTA4fQ.zS0JKAk2lDE_oBFk5Z0g9Yhaln9hbbU6kV8j-M0fKN4",
          },
        })
      ).data;
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
