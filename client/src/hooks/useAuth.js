import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useState,
} from "react";
import { users } from "../data/users";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    () => users.find((user) => user.active && user.role === "guest") || null,
  );

  const login = (email, password) => {
    if (!email || !password) {
      return false;
    }

    const matchedUser = users.find(
      (user) => user.active && user.email.toLowerCase() === email.toLowerCase(),
    );

    if (!matchedUser) {
      return false;
    }

    setCurrentUser(matchedUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      login,
      logout,
      isAuthenticated: Boolean(currentUser),
    }),
    [currentUser],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
