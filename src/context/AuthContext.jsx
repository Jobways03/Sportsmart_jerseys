// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Persist token
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const login = (t) => setToken(t);
  const logout = () => setToken("");

  return (
    <AuthContext.Provider value={{ token, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
}
