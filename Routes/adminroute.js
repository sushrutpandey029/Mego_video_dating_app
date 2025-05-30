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
  disabledUserByAdmin,
  getReports,
  paymentHistroy,
  getallUSerSubscription,
  userProfileView,
  AllUserReported,
  getNewUsersInMonth,
  getDisabledUsersCount,
  getActiveUsers,
  getReportedUsers,
  AddSubscription,
  getSubscription,
  SubscriptionList,
  editSubscription,
  updateSubscription

  
  
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
router.get('/reports/:id',verifyToken, getReports);
router.get('/payment-history',verifyToken,paymentHistroy);
router.get('/getAllUserSubscription',verifyToken, getallUSerSubscription);
router.get('/user-profile/:id',verifyToken,userProfileView);
router.get('/all-reported-users/:id',verifyToken,AllUserReported );
router.get("/users/new",verifyToken, getNewUsersInMonth);
router.get("/users/disabled", getDisabledUsersCount);
router.get("/users/active",verifyToken,getActiveUsers);
router.get('/reported-users',getReportedUsers);
router.post('/userdisable/:id', disabledUserByAdmin);
router.post("/add-subscription", AddSubscription);
router.get("/GetSubscription", getSubscription);
router.get("/Susbscrption_List",SubscriptionList);
router.get("/edit-subscription/:id",verifyToken, editSubscription);
router.post("/update-subscription/:id", verifyToken, updateSubscription);
export default router;
