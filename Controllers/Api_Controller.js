import usermodel from '../Model/UserModel.js'
import blockedmodel from '../Model/BlockedModel.js'
import path from 'path';
import { error } from 'console';
import messageModel from '../Model/messageModel.js'
import exp from 'constants';

// const { Op } = require("sequelize");
import { Op } from 'sequelize';

export const userregister = async (req, res) => {
    try {
        const body = req.body;

        const { phonenumber, name, email, age, gender, about,
            relationship, interest, latitude, longitude } = body

        let profileimage = null;

        console.log("body data", body)

        if (!phonenumber || !name || !email || !age || !gender || !relationship || !interest || !latitude || !longitude) {
            return res.status(401).json({
                success: false,
                message: "All filed are required"
            })
        }

        // Validate phone number
        // const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
        // if (phonenumber && !phoneRegex.test(phonenumber)) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Mobile number is not valid",
        //     });
        // }

        // Check for duplicate email
        const isDuplicatephone = await usermodel.findOne({ where: { phonenumber } });

        if (isDuplicatephone) {
            return res.status(401).json({
                success: false,
                message: "Phone is allready in Use"
            })
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(401).json({
                success: false,
                message: "Email is not validate"
            })
        }

        // Check for duplicate email
        const isDuplicateEmail = await usermodel.findOne({ where: { email } });

        if (isDuplicateEmail) {
            return res.status(401).json({
                success: false,
                message: "Email is allready in Use"
            })
        }

        // If a profile image is uploaded, store only the file name
        if (req.file) {
            profileimage = path.basename(req.file.path); // Save only the file name (e.g., 'image-xyz.jpg')
        } else {
            if (!profileimage) {
                return res.status(401).json({
                    success: false,
                    message: "Profile image is required",
                });
            }
        }

        const data = await usermodel.create({
            phonenumber,
            name,
            email,
            age,
            gender,
            about,
            looking_for: relationship,
            interest,
            profileimage,
            latitude,
            longitude
        })

        console.log("new data", data)

        return res.status(200).json({
            success: true,
            message: "data insert successfully",
            data: data
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server err",
            err: err.message
        })
    }
};

export const userlogin = async (req, res) => {

    const body = req.body;

    const { phonenumber } = body;

    if (!phonenumber) {
        return res.status(401).json({
            success: false,
            message: "Phone number required"
        });
    }

    const userlogin = await usermodel.findOne({ where: { phonenumber } });

    if (!userlogin) {
        return res.status(401).json({
            success: false,
            message: "User not found",
        });
    }

    req.session.user = userlogin;

    console.log("user-session", req.session.use);
    return res.status(201).json({
        success: true,
        message: "users",
        data: userlogin
    })


};

export const updateuserprofile = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, email, age, gender, about, relationship, interest } = req.body;

        console.log("Received request body:", req.body);
        console.log("Uploaded files:", req.files);

        if (!name || !email || !age || !gender || !relationship || !interest) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const user = await usermodel.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        let profileimage = user.profileimage;
        if (req.files.profileimage) {
            profileimage = path.basename(req.files.profileimage[0].path);
        }
        let Imageone = user.Imageone;
        let Imagetwo = user.Imagetwo;
        let Imagethree = user.Imagethree;
        let Imagefour = user.Imagefour;
        let Imagefive = user.Imagefive;

        if (req.files.Imageone) Imageone = path.basename(req.files.Imageone[0].path);
        if (req.files.Imagetwo) Imagetwo = path.basename(req.files.Imagetwo[0].path);
        if (req.files.Imagethree) Imagethree = path.basename(req.files.Imagethree[0].path);
        if (req.files.Imagefour) Imagefour = path.basename(req.files.Imagefour[0].path);
        if (req.files.Imagefive) Imagefive = path.basename(req.files.Imagefive[0].path);

        await user.update({
            name,
            email,
            age,
            gender,
            about,
            looking_for: relationship,
            interest,
            profileimage,
            Imageone,
            Imagetwo,
            Imagethree,
            Imagefour,
            Imagefive
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });

    } catch (err) {
        console.error("Error updating user profile:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};

export const updatelocation = async (req, res) => {
    try {
        const { id } = req.params;

        const { latitude, longitude } = req.body;

        console.log("Received request body:", req.body);
        console.log("Uploaded files:", req.files);

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const user = await usermodel.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await user.update({
            latitude,
            longitude
        });

        return res.status(200).json({
            success: true,
            message: "Location Updated Successfully",
            data: user
        });

    } catch (err) {
        console.error("Error updating user location:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};

export const getuserprofile = async (req, res) => {
    try {

        const { id } = req.params;


        const user = await usermodel.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User Profile",
            data: user
        });

    } catch (err) {
        console.error("Error geting user profile:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server error",
            error: err.message
        })
    }
};

export const getalluser = async (req, res) => {
    try {
        const user = await usermodel.findAll();

        return res.status(200).json({
            success: true,
            message: "Users",
            data: user
        });

    } catch (err) {
        console.error("Error geting user profile:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server error",
            error: err.message
        })
    }
};

export const sendmesg = async (req, res) => {
    try {

        const body = req.body

        const { sender_id, receiver_id, message } = body;

        if (!sender_id || !receiver_id || !message) {
            return res.status(401).json({
                success: false,
                message: "All field required"
            })
        }

        const data = await messageModel.create({
            sender_id, receiver_id, message
        })

        console.log("data", data);

        return res.status(200).json({
            success: true,
            message: "message send successfully.",
            data: data
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        })

    }
}

export const chatlist = async (req, res) => {
    try {
        const { sender_id } = req.params;

        // Fetch chat data with latest messages first
        const chatdata = await messageModel.findAll({
            where: { sender_id },
            attributes: ["receiver_id", "message", "createdAt"],
            order: [["createdAt", "DESC"]] // Order by latest messages first
        });

        console.log("chatdata", chatdata);

        if (!chatdata.length) {
            return res.status(401).json({
                success: false,
                message: "User Chat list is Empty",
                data: null
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
        const receiverIds = uniqueChatData.map(chat => chat.receiver_id);

        console.log("receiverIds", receiverIds);

        // Fetch user details for all receiver IDs
        const userdata = await usermodel.findAll({
            where: { id: { [Op.in]: receiverIds } },
            attributes: ["name", "profileimage", "phonenumber"]
        });

        console.log("userdata", userdata);

        return res.status(200).json({
            success: true,
            message: "User Chat List",
            userlist: userdata,
            chatdata: uniqueChatData
        });
    } catch (error) {
        console.error("Error fetching chat list:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const messagehistory = async (req, res) => {
    try {
        const { sender_id, receiver_id } = req.params

        const chatHistory = await messageModel.findAll({
            where: { sender_id, receiver_id },
            attributes: ["message", "createdAt"]
        });

        if (!chatHistory.length) {
            return res.status(401).json({
                success: false,
                message: "user chat list is empty",
                data: null
            })
        }

        console.log("chatHistory", chatHistory);

        return res.status(200).json({
            success: true,
            message: "User Chat List",
            chatHistory: chatHistory
        });
    } catch (err) {
        console.error("Error fetching chat list:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// export const blockuser = async (req,res) =>{

//     const body = req.body

//     const {blockedby, blockedto, status} = body

// }















