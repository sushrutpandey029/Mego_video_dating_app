import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import adminModel from "../Model/adminModel.js";
import usermodel from "../Model/UserModel.js";
import Statusmodel from "../Model/StatusModel.js";
import statusModel from "../Model/StatusModel.js";
import messageModel from "../Model/messageModel.js";
import reportModel from "../Model/reportModel.js";
import { Op } from "sequelize";
import { response } from "express";

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
    const user = await usermodel.findAll();
    // console.log("user", user);

    const totalUsers = user.length;
    const maleUsers = user.filter((user) => user.gender === "male").length;
    const femaleUsers = user.filter((user) => user.gender === "female").length;

    const countUsers = {
      totalUsers,
      maleUsers,
      femaleUsers,
    };

    // req.session.countUsers = countUsers;
    console.log("session-data", req.session);

    return res.render("dashboard", { user: req.session.admin, countUsers });
  } catch (err) {
    console.log(err);
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

export const renderStatusUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["enable", "disable"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const user = await usermodel.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await statusModel.insert({ userId, status });
    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
    });
  } catch (err) {
    console.error("Error updating user status:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Get user status

export const renderUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const status = await Statusmodel.findOne({ where: { userId } });
    if (!status) {
      return res.status(404).json({
        success: false,
        message: "User status not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (err) {
    console.error("Error fetching user status:", err);
    return res.status(500).json({
      success: false,
      message: "Internasl server error",
      error: err.message,
    });
  }
};

export const renderUpdateStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["enable", "disable"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }
    const user = await usermodel.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await statusModel.update({ status }, { where: { userId } });
    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
    });
  } catch (err) {
    console.error("Error updating user status:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const renderAdminChatList = async (req, res) => {
  try {
    const { sender_id } = req.params;

    // Fetch chat data with latest messages first
    const chatdata = await messageModel.findAll({
      where: { sender_id },
      attributes: ["receiver_id", "message", "createdAt"],
      order: [["createdAt", "DESC"]], // Order by latest messages first
    });

    console.log("chatdata", chatdata);

    if (!chatdata.length) {
      return res.status(401).json({
        success: false,
        message: "User Chat list is Empty",
        data: null,
      });
    }
    // Remove duplicates, keeping only the latest message per receiver
    const uniqueChatData = [];
    const seenReceivers = new Set();

    for (const chat of chatdata) {
      if (!seenReceivers.has(chat.receiver_id)) {
        seenReceivers.add(chat.receiver_id);
        uniqueChatData.push(chat);
      }
    }

    // Extract unique receiver IDs
    const receiverIds = uniqueChatData.map((chat) => chat.receiver_id);

    console.log("receiverIds", receiverIds);

    // Fetch user details for all receiver IDs
    const userdata = await usermodel.findAll({
      where: { id: { [Op.in]: receiverIds } },
      attributes: ["id", "name", "profileimage", "phonenumber"],
    });

    console.log("userdata", userdata);

    return res.render("chatlist", {
      userlist: userdata,
      chatdata: uniqueChatData,
    });
  } catch (error) {
    console.error("Error fetching chat list:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const renderAdminChatHistory = async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.params;

    // Fetch chat history between sender and receiver
    const chatHistory = await messageModel.findAll({
      where: {
        [Op.or]: [
          { sender_id, receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id },
        ],
      },
      attributes: ["sender_id", "receiver_id", "message", "createdAt"],
      order: [["createdAt", "ASC"]], // Order by oldest messages first
    });

    console.log("chatHistory", chatHistory);

    if (!chatHistory.length) {
      return res.status(401).json({
        success: false,
        message: "Chat history is empty",
        data: null,
      });
    }

    return res.render("chatHistory", {
      chatHistory: chatHistory,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getReports = async (req, res) => {
  try {
    const { id } = req.params;

    const reports = await reportModel.findAll({
      where: { reportedTo: id },
      attributes: ["reportedBy", "reportedTo", "reason", "status"],
    });

    const reportCount = reports.length;

    console.log("reports", reports);

    return res.render("reportList", {
      reports: reports,
      reportCount: reportCount,
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
