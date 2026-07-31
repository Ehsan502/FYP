import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext();

// Dynamic URL: Netlify par live Vercel URL uthayega, local par localhost
const API_ORIGIN = import.meta.env.PROD 
  ? "https://fyp-ashen-kappa.vercel.app" 
  : "http://localhost:5000";

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
    
    // Live Server Sync Configuration
    const socket = io(API_ORIGIN, {
      auth: { token },
      transports: ["websocket", "polling"],
      secure: true,
    });

    socket.on("connect", () => {
      console.log("Socket Connected Successfully to:", API_ORIGIN);
      setConnected(true);
    });

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