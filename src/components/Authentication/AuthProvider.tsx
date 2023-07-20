import { createContext, useContext } from "react";

const AuthContext = createContext({});

type Props = {
  children: any;
};

export function AuthProvider({ children }: Props) {
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
