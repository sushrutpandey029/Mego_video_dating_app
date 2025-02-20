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
  renderMaleUser,
  renderFemaleUser
} from "../Controllers/Admin_Controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/login", handleAdminLogin);
router.get("/", renderAdminLogin);
router.get("/dashboard",verifyToken, renderDashboard);
router.post('/adminRegister',adminRegister);
router.get("/logout",handleLogout);
router.get("/showProfile",verifyToken,ShowProfile);
router.post("/update",verifyToken,updateProfile);
router.post('/change-password/:id',verifyToken, HandelChangPassword);
router.get('/change-password',verifyToken, passwordChange);
router.get("/male-users",verifyToken, renderMaleUser);
router.get("/female-users",verifyToken, renderFemaleUser);




export default router;
