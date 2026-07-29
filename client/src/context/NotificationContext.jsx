import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "./AuthContext.jsx";
import { useSocket } from "./SocketContext.jsx";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      // silent fail, non-critical
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    if (!socket) return;
    const handler = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [socket]);

  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (err) {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.put("/notifications/read-all");
    } catch (err) {
      // ignore
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, reload: load }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
