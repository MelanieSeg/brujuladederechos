import React, { createContext, useState, useEffect, ReactNode } from "react";
import api from "../services/axiosAuthInstance";



export const AuthContext = createContext({
  user: null,
  accessToken: null,
  isLoading: true,
  login: async () => { },
  logout: async () => { },
  updateUser: () => { }
})



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  )
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split(".")[1]))

          const currentTime = Date.now() / 1000;
          if (payload.exp > currentTime) {
            // Token es valido
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
            setIsLoading(false);
          } else {
            // token expirado, intentar renovarlo
            await refreshAccessToken();
          }
        } catch (err) {
          console.log("Error decodificando el accessToken : ", err)
          await refreshAccessToken();
        }
      } else {
        // no hay un accesstoken, intenar renovarlo
        await refreshAccessToken();
      }
    }
    const refreshAccessToken = async () => {
      try {
        const response = await api.post("/refresh-token");
        const { accessToken: newAccessToken, user: refreshedUser } =
          response.data;
        setAccessToken(newAccessToken);
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("user", JSON.stringify(refreshedUser));
        setUser(refreshedUser);
      } catch (error) {
        console.error("Error al renovar el accessToken:", error);
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [])


  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const { accessToken: newAccessToken, user: loggedInUser } = response.data;
      setAccessToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (err) {
      throw err;
    }
  }

  const logout = async () => {
    try {
      await api.post("/logout");
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setIsLoading(false)
      window.location.href = "/login";
    } catch (error) {
      console.error("Error durante el logout:", error);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // aca indicamos que se renderize solo cuando esta cargando 
  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, updateUser }}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}
