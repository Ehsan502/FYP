import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader full />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminRoute;
