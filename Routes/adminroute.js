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
  renderTotalUser,
  // renderStatusUser,
  // renderUserStatus,
  // renderUpdateStatus,
  // renderAdminChatList,
  // renderAdminChatHistory,
  getReports
  
} from "../Controllers/Admin_Controller.js";
import verifyToken from "../Middlewares/verifyToken.js";

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
router.get("/users/female",verifyToken,renderFemaleUser);
router.get("/users/male",verifyToken,renderMaleUser);
router.get("/users",verifyToken,renderTotalUser);
// router.post("/status/:id",verifyToken, renderStatusUser);
// router.get("status/:id",verifyToken, renderUserStatus);
// router.post("/statusUpdate/:id",verifyToken, renderUpdateStatus);
// router.get('/chatlist/:sender_id',verifyToken,renderAdminChatList);
// router.get('/messagehistory/:sender_id/:receiver_id', verifyToken,renderAdminChatHistory);
router.get('/reports/:id',verifyToken, getReports);

export default router;
