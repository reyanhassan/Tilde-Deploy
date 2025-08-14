// src/context/AuthContext.ts
import { createContext, useContext } from "react";

interface Session {
  user: {
    name: string;
    email: string;
    image: string;
  };
}

interface AuthContextType {
  signIn: (user: Session["user"]) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  session: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}
