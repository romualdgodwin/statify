import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

export type AuthContext = {
  id?: string;
  token?: string;
  setAuth: (id: string, token: string) => void;
};

const AuthContext = createContext<AuthContext>({
  id: undefined,
  token: undefined,
  setAuth: () => {},
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [id, setId] = useState<string>();
  const [token, setToken] = useState<string>();

  const setAuth = useCallback((id: string, token: string) => {
    setId(id);
    setToken(token);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        id,
        token,
        setAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
