import { Page } from "./Page";
import { useUsers } from "./useUsers";

export const Users = () => {
  const { isLoading, users, error } = useUsers();

  return (
    <Page title="Users">
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <>
          {error ? (
            <div>{error}</div>
          ) : (
            <ul>
              {users.map((user) => (
                <li key={user.id}>{user.login}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </Page>
  );
};
