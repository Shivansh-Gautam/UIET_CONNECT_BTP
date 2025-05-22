import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");

    if (token) {
      setAuthenticated(true);
    }

    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const login = (credentials, token) => {
    setAuthenticated(true);
    setUser(credentials);
    localStorage.setItem("authToken", token); // Store token in localStorage
    localStorage.setItem("user", JSON.stringify(credentials)); // Store user in localStorage
  };

  const logout = () => {
    setAuthenticated(false);
    setUser(null);
    localStorage.removeItem("authToken"); // Remove token from localStorage
    localStorage.removeItem("user"); // Remove user from localStorage
  };
  const homeout = () => {
    setAuthenticated(false);
    setUser(null);
    localStorage.removeItem("authToken"); // Remove token from localStorage
    localStorage.removeItem("user"); // Remove user from localStorage
  };

  return (
    <AuthContext.Provider value={{ authenticated, user, login, logout, homeout }}>
      {children}
    </AuthContext.Provider>
  );
};
