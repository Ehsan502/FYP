import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";
import { API_ORIGIN } from "../config.js";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [connected, setConnected] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const token = localStorage.getItem("skillswap_token");
    const socket = io(API_ORIGIN, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("presence:update", ({ userId, isOnline }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (isOnline) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    socketRef.current = socket;
    forceUpdate((n) => n + 1);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const isOnline = (userId) => onlineUsers.has(userId?.toString());

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
