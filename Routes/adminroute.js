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
  renderFemaleUser,
  renderEditUser,
  renderTotalUser
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
router.get("/users/male",verifyToken, renderMaleUser);
router.get("/female-users",verifyToken, renderFemaleUser);
router.get("/edit-user",verifyToken,renderEditUser);
router.get("/users/female",verifyToken,renderFemaleUser);
router.get("/users/male",verifyToken,renderMaleUser);
router.get("/users",verifyToken,renderTotalUser);




export default router;
