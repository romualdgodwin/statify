import { Page } from "../components/Page";
import { useUsers } from "../hooks/useUsers";

export const Users = () => {
  const { isLoading, users, error } = useUsers();

  return (
    <Page title="Users">
      {isLoading ? (
        <span data-testid="loading">Loading...</span>
      ) : (
        <>
          {error ? (
            <div>{error}</div>
          ) : (
            <ul data-testid="users">
              {users.map((user) => (
                <li data-testid={`user-${user.id}`} key={user.id}>
                  {user.login}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Page>
  );
};
