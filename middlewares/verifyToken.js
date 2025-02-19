import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.session?.user?.accessToken || null;
    console.log("token",token)
    console.log("session", req.session);
    if (!token) {
      req.flash("error", "Access Denied! Please log in.");
      return res.redirect("/");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      req.flash("error", "Invalid or expired token, Please login again.");
      return res.redirect("/");
    }
  } catch (err) {
    console.log("err", err);
  }
};
