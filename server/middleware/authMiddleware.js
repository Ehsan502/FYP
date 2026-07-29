import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Decode Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from DB except password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      if (req.user.isBlocked) {
        return res
          .status(403)
          .json({ message: "Your account has been blocked." });
      }

      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Not authorized, token validation failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }
};