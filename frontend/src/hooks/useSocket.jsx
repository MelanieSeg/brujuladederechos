
import React, { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext";

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket debe ser utilizado dentro de un SocketProvider");
  }
  return context;
};

