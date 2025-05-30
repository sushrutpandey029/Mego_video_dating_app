import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import adminModel from "../Model/adminModel.js";
import PayUModel from "../Model/PayUModel.js";
import usermodel from "../Model/UserModel.js";
import messageModel from "../Model/messageModel.js";
import reportModel from "../Model/reportModel.js";
import { Op, Sequelize } from "sequelize";
import { response } from "express";
import SubscriptionModel from "../Model/subscriptionModel.js";
import StatusModel from "../Model/StatusModel.js";
import Subscription from "../Model/addPlanModel.js";
import  Subscription_Plan from "../Model/addPlanModel.js";

dotenv.config();

export const renderAdminLogin = async (req, res) => {
  try {
    return res.render("index");
  } catch (err) {
    console.log(err);
  }
};

export const handleAdminLogin = async (req, res) => {
  try {
    //fetch data from req.body
    const { email, password } = req.body;
    //validate data
    if (!email || !password) {
      req.flash("error", "All fields are required.");
      return res.redirect("/");
    }
    //check if user exist or not
    const admin = await adminModel.findOne({ where: { email } });
    if (!admin) {
      req.flash("error", "admin is not registered, please signup first.");
      return res.redirect("/");
    }
    //check password
    if (await bcrypt.compare(password, admin.password)) {
      //creating jwt token
      const payload = {
        name: admin.fullname,
        email: admin.email,
        id: admin.id,
      };

      const options = {
        expiresIn: 7 * 24 * 60 * 60 * 1000,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, options);

      admin.token = token;
      admin.password = undefined;
      admin.accessToken = token;
      // console.log("admin access token",admin.accessToken);

      req.session.admin = admin;

      console.log("admin-session", req.session);
      req.flash("success", "Logged in successfully, Welcome to home page...");
      return res.redirect("/dashboard");
    } else {
      req.flash("error", "Password is incorrect, please try again.");
      return res.redirect("/");
    }
    //create jwt token and return response
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: "Failed to login, please try again.",
      err: err.message,
    });
  }
};

export const adminRegister = async (req, res) => {
  try {
    const { fullname, email, password, phoneNumber } = req.body;
    // Validate input
    if (!fullname || !email || !password || !phoneNumber) {
      return res
        .status(401)
        .json({ errormessage: "please fill all the fields" });
    }
    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(401).json({ message: "Invalid +" });
    }

    const isDuplicateEmail = await adminModel.findOne({ where: { email } });
    if (isDuplicateEmail) {
      return res.status(401).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    const newAdmin = new adminModel({
      fullname,
      email,
      planePassword: password,
      password: hashpassword,
      phoneNumber,
    });
    await newAdmin.save();

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: newAdmin,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const renderDashboard = async (req, res) => {
  try {
    const currentDate = new Date();

    // Define the full date range for current month in local time
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const users = await usermodel.findAll();

    const totalUsers = users.length;
    const maleUsers = users.filter(user => user.gender === "male").length;
    const femaleUsers = users.filter(user => user.gender === "female").length;

    const newUsers = await usermodel.findAll({
      where: {
        createdAt: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
    });

    const disabledUsers = await StatusModel.count({
      where: { status: "disable" }
    })
    console.log("disabledUsers", disabledUsers);
    console.log("Date range:", firstDayOfMonth, lastDayOfMonth);
    console.log("New Users This Month:", newUsers.length);

    const activeUsers = totalUsers - disabledUsers;

    //  Count of reported users (distinct reportedTo)
    const reportedUsersCount = await reportModel.count({
      col: 'reportedTo',
      distinct: true,
    });



    const countUsers = {
      totalUsers,
      maleUsers,
      femaleUsers,
      NewUsers: newUsers.length,
      disabledUsers,
      activeUsers,
      reportedUsersCount


    };

    return res.render("dashboard", { user: req.session.admin, countUsers });
  } catch (err) {
    console.error("Error in renderDashboard:", err);
    return res.status(500).send("Internal Server Error");
  }
};

export const handleLogout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ success: false, message: err.message });
      }

      res.clearCookie("connect.sid");
      return res.redirect("/");
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

export const ShowProfile = async (req, res) => {
  try {
    console.log("session-dashboard", req.session.admin);
    return res.render("profile", { admin: req.session.admin });
  } catch (err) {
    console.log(err);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber } = req.body;
    const adminId = req.session.admin.id;

    console.log("hello", fullname, email, phoneNumber);

    if (!fullname || !email || !phoneNumber) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    // validate email format
    const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if email is already in use by another admin
    const existingAdmin = await adminModel.findOne({ where: { email } });

    if (existingAdmin) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Update admin profile
    const updatedAdmin = await adminModel.update(
      { fullname, email, phoneNumber },
      { where: { id: adminId } }
    );

    if (updatedAdmin[0] === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.redirect("/dashboard");

    // return res.status(200).json({
    //   succeess: true,
    //   message: "Profile updated successfully",
    // });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const HandelChangPassword = async (req, res) => {
  try {
    const id = req.params.id;

    console.log("id", id);

    // Fetch all fund records with their primary key

    const admin = await adminModel.findByPk(id);

    console.log("admin", admin);

    //  return res.render('admin_chng_pswd', { admin });

    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(401).json({ message: "Please fill all the fields" });
    }
    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res
        .status(401)
        .json({ message: "New password and confirm password do not match" });
    }

    // Find admin by ID (assuming admin ID is passed in the request body)
    // const admin = await adminModel.findByPk(req.body.adminId);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Check if old password is correct
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "old password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(newPassword, salt);

    // Update password
    admin.password = hashpassword;
    admin.planePassword = newPassword;

    await admin.save();

    return res.redirect("/dashboard");

    // return res.status(200).json({
    //   success: true,
    //   message: "Password changed successfully",
    // });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const passwordChange = async (req, res) => {
  console.log("user", req.session.admin);
  res.render("changePassword", { user: req.session.admin });
};

export const renderTotalUser = async (req, res) => {
  try {
    const user = await usermodel.findAll();
    console.log("total-user", user);
    return res.render("user-list", { user });
  } catch (err) {
    console.log(err);
  }
};

export const renderMaleUser = async (req, res) => {
  try {
    const user = await usermodel.findAll({ where: { gender: "male" } });
    console.log("male-user", user);
    return res.render("user-list", { user });
  } catch (err) {
    console.log(err);
  }
};

export const renderFemaleUser = async (req, res) => {
  try {
    const user = await usermodel.findAll({ where: { gender: "female" } });

    return res.render("user-list", { user });
  } catch (err) {
    console.log(err);
  }
};

export const getReports = async (req, res) => {
  try {
    const { id } = req.params;

    const reports = await reportModel.findAll({
      where: { reportedTo: id },
      attributes: ["id", "reportedBy", "reportedTo", "reason", "createdAt"],
    });

    console.log("reports", reports);

    const reportedByIds = reports.map(report => report.reportedBy);
    const reportedByUsers = await usermodel.findAll({
      where: { id: { [Op.in]: reportedByIds } },
      attributes: ["id", "name", "profileimage", "phonenumber"],
    });

    const reportsWithUserDetails = reports.map(report => {
      const reportedByUser = reportedByUsers.find(user => user.id === report.reportedBy);
      return {
        ...report.dataValues,
        reportedByUser,
      };
    });

    console.log("reportsWithUserDetails", reportedByUsers);

    return res.render("reportList", {
      reports: reportsWithUserDetails,
      userdata: reportedByUsers
    });

  } catch (error) {
    console.log("Error fetching reports:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });

  }

};

export const paymentHistroy = async (req, res) => {
  try {
    const paymentHistory = await PayUModel.findAll();
    res.render("paymentHistory", { paymentHistory })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    })
  }
};

export const getallUSerSubscription = async (req, res) => {
  try {
    const getallUSerSubscription = await SubscriptionModel.findAll();
    res.render("subscriptionPlan", { getallUSerSubscription })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    })
  }
};

export const userProfileView = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await usermodel.findOne({ where: { id: id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("user", user);
    return res.render("userProfile", { user });
  } catch (err) {
    console.log(err);
  }
};

export const AllUserReported = async (req, res) => {
  const { id } = req.params;
  try {
    const AllUserReported = await reportModel.findAll({ where: { reportedBy: id } });
    console.log("AllUSerRepoted", AllUserReported);
    return res.render("allReportedUser", { reports: AllUserReported });
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
};

export const getNewUsersInMonth = async (req, res) => {
  try {
    const currentDate = new Date();

    // Define the full date range for current month in local time
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const newUsers = await usermodel.findAll({
      where: {
        createdAt: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
    });
    return res.render("user-list", { user: newUsers });


  } catch (error) {
    console.error("Error fetching new users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getDisabledUsersCount = async (req, res) => {
  try {
    //  Querry the database to get the count of disabled users 
    const disabledUsers = await StatusModel.findAll({
      where: {
        status: "disable",  //Assuming the "status" column exists in the usermodel
      },
    });

    // Step 2: Get user details of reported users from usermodel
    const reportedUsers = await usermodel.findAll({
      where: {
        id: {
          [Op.in]: disabledUsers.map(user => user.userId), // Assuming userId is the foreign key in StatusModel
        },
      },

      // attributes: ['id', 'name', 'profileimage'],
    });

    console.log("reportedUsers", reportedUsers);

    return res.render("user-list", { user: reportedUsers });

  } catch (error) {
    console.error("Error fetching disabled users count:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    // Step 1: Get all user IDs with status === "disable"
    const disabledStatus = await StatusModel.findAll({
      where: { status: 'disable' },
      attributes: ['userId'], // Only get the userId field
      raw: true,
    });

    // Extract just the IDs
    const disabledUserIds = disabledStatus.map((status) => status.userId);

    // Step 2: Get users from usermodel whose IDs are NOT in the list above
    const activeUsers = await usermodel.findAll({
      where: {
        id: {
          [Op.notIn]: disabledUserIds,
        },
      },
    });

    // Render or return filtered active users
    return res.render('user-list', { user: activeUsers });

  } catch (error) {
    console.error("Error fetching active users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getReportedUsers = async (req, res) => {
  try {
    // Step 1: Get all distinct reportedTo user IDs from the reports table
    const reportedUserIdsData = await reportModel.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('reportedTo')), 'reportedTo']],
      raw: true,
    });

    console.log("reportedUserIdsData", reportedUserIdsData);

    const reportedUserIds = reportedUserIdsData.map(entry => entry.reportedTo);

    console.log("reportedUserIds", reportedUserIds);

    // Step 2: Get user details of reported users from usermodel
    const reportedUsers = await usermodel.findAll({
      where: {
        id: {
          [Op.in]: reportedUserIds,
        },
      },

      // attributes: ['id', 'name', 'profileimage'],
    });

    console.log("reportedUsers", reportedUsers);

    // Step 3: Count reported users
    const reportedUsersCount = reportedUserIds.length;
    console.log("reportedUsersCount", reportedUsersCount);

    // Step 4: Render the user list with count
    return res.render('user-list', {
      user: reportedUsers,
      reportedUsersCount,
    });

  } catch (error) {
    console.error("Error fetching reported users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const disabledUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const status = "disable";
    const totalCount = '5';

    console.log("Disabling user with ID:", id);

    const user = await usermodel.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Optional: Check if already disabled
    const alreadyDisabled = await StatusModel.findOne({ where: { userId: id, status } });
    if (alreadyDisabled) {
      return res.render("reportList");
    }

    const disableuser = new StatusModel({ 
      userId: id,
      status,
      totalCount
    });

    await disableuser.save();

    return res.redirect("/reported-users");

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const AddSubscription = async (req, res) => {
  try {
   const { planName, amount, planType, description } = req.body;

      console.log("data", req.body);


    // Handle POST request
    
    if (!planName || !amount || !planType) {
      return res.status(400).render("AddSubscription", {
        error: "All fields except description are required.",
      });
    }

    await Subscription.create({
      planName,
      amount,
      planType,
      description,
    });

    return res.render("addSubscription");

  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).render("addSubscription", {
      error: "Internal Server Error",
    });
  }
};


 export const getSubscription = async (req, res) => {
  try {
    return res.render("addSubscription");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}; 

export const SubscriptionList = async (req,res) => {
  try{
    const subscription = await Subscription_Plan.findAll();

    console.log("subscription", subscription);

    return res.render("Subscription_List", {subscription});
  }
   catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const editSubscription = async (req,res) => {
  try{
    const { id } = req.params;

    const subscription = await Subscription_Plan.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found"});
      
    }
     return res.render("Edit_subscription", { subscription });
  } 

  catch (error) {
    res.status(500).send("Internal Server Error");
  }
}


export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { planName, amount, planType, description } = req.body;

    console.log("data", req.body);

    if (!planName || !amount || !planType) {
      return res.status(400).render("Edit_subscription", {
        error: "All fields except description are required.",
        subscription: { id, planName, amount, planType, description }
      });
    }

    const subscription = await Subscription_Plan.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Update fields
    subscription.planName = planName;
    subscription.amount = amount;
    subscription.planType = planType;
    subscription.description = description;

    await subscription.save();

    // Redirect to the subscription list after update
    return res.redirect("/Susbscrption_List");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};