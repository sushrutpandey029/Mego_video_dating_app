import express from "express";
import {
  handleAdminLogin,
  renderAdminLogin,
  renderDashboard,
  adminRegister,
  handleLogout,
  ShowProfile,
  updateProfile,
  HandelChangPassword,
  passwordChange,
  TotalUser
} from "../Controllers/Admin_Controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/login", handleAdminLogin);
router.get("/", renderAdminLogin);
router.get("/dashboard",verifyToken, renderDashboard);
router.post('/adminRegister',adminRegister);
router.get("/logout",handleLogout);
router.get("/showProfile",ShowProfile);
router.post("/update",updateProfile);
router.post('/change-password/:id', HandelChangPassword);
router.get('/change-password', passwordChange);
router.get('/totaluser', TotalUser);


export default router;
