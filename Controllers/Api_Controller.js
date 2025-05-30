import usermodel from "../Model/UserModel.js";
import blockedmodel from "../Model/BlockedModel.js";
import { Op } from "sequelize";
import { Sequelize } from "sequelize";
import crypto from "crypto";
import path from "path";
import { error } from "console";
import messageModel from "../Model/messageModel.js";
import exp from "constants";
import reportModel from "../Model/reportModel.js";
import favoriteModel from "../Model/FavoriteModel.js";
import interestedModel from "../Model/IntrestedModel.js";
import payuConfig from "../payuConfig.js";
import SubscriptionModel from "../Model/subscriptionModel.js";
import PayUModel from "../Model/PayUModel.js";
import StatusModel from "../Model/StatusModel.js";
import { subscribe } from "diagnostics_channel";
import { toASCII } from "punycode";

// import { payuConfig  }  from  "../../Config/payuConfig.js";
// import payUModel from "../Model/PayUModel.js";
// import { transferableAbortController } from "util";
// import PayUModel from "../Model/PayUModel.js";

export const userregister = async (req, res) => {
    try {
        const body = req.body;

    const {
      phonenumber,
      name,
      email,
      age,
      gender,
      about,
      relationship,
      interest,
      latitude,
      longitude,
      fcm_user_id
    } = body;

        let profileimage = null;

        console.log("body data", body);

    if (
      !phonenumber ||
      !name ||
      !email ||
      !age ||
      !gender ||
      !relationship ||
      !interest ||
      !relationship ||
      !latitude ||
      !longitude ||
      !fcm_user_id
    ) {
      return res.status(401).json({
        success: false,
        message: "All filed are required",
      });
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
        const isDuplicatephone = await usermodel.findOne({
            where: { phonenumber },
        });

        if (isDuplicatephone) {
            return res.status(401).json({
                success: false,
                message: "Phone is allready in Use",
            });
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(401).json({
                success: false,
                message: "Email is not validate",
            });
        }

        // Check for duplicate email
        const isDuplicateEmail = await usermodel.findOne({ where: { email } });

        if (isDuplicateEmail) {
            return res.status(401).json({
                success: false,
                message: "Email is allready in Use",
            });
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
      longitude,
      fcm_user_id
    });

        console.log("new data", data);

        return res.status(200).json({
            success: true,
            message: "data insert successfully",
            data: data,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server err",
            err: err.message,
        });
    }
};

export const userlogin = async (req, res) => {
    try {
        const body = req.body;
        const { phonenumber } = body;

        if (!phonenumber) {
            return res.status(401).json({
                success: false,
                message: "Phone number required",
            });
        }

        // Find the user by phone number
        const userlogin = await usermodel.findOne({ where: { phonenumber } });

        if (!userlogin) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if the user is disabled in the reportModel
        const isDisabled = await StatusModel.findOne({
            where: {
                userId: userlogin.id,
                status: "disable",
            },
        });

        if (isDisabled) {
            return res.status(403).json({
                success: false,
                message: "Your account is disabled due to multiple reports. please contact support.",
            })
        }

        // Save user session
        req.session.user = userlogin;

        console.log("user-session", req.session.user);

        return res.status(201).json({
            success: true,
            message: "Logged In Successfully.",
            data: userlogin,
        });
    } catch (err) {
        console.error("Error during user login:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

export const updateuserprofile = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, email, age, gender, about, relationship, interest } =
            req.body;

        console.log("Received request body:", req.body);
        console.log("Uploaded files:", req.files);

        if (!name || !email || !age || !gender || !relationship || !interest) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const user = await usermodel.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
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

        if (req.files.Imageone)
            Imageone = path.basename(req.files.Imageone[0].path);
        if (req.files.Imagetwo)
            Imagetwo = path.basename(req.files.Imagetwo[0].path);
        if (req.files.Imagethree)
            Imagethree = path.basename(req.files.Imagethree[0].path);
        if (req.files.Imagefour)
            Imagefour = path.basename(req.files.Imagefour[0].path);
        if (req.files.Imagefive)
            Imagefive = path.basename(req.files.Imagefive[0].path);

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
            Imagefive,
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    } catch (err) {
        console.error("Error updating user profile:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
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
                message: "All fields are required",
            });
        }

        const user = await usermodel.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        await user.update({
            latitude,
            longitude,
        });

        return res.status(200).json({
            success: true,
            message: "Location Updated Successfully",
            data: user,
        });
    } catch (err) {
        console.error("Error updating user location:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
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
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User Profile",
            data: user,
        });
    } catch (err) {
        console.error("Error geting user profile:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server error",
            error: err.message,
        });
    }
};

//  export const getalluser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const blockedUsers = await reportModel.findAll({
//       where: { [Op.or]: [{ reportedBy: id }, { reportedTo: id }] },
//       attributes: ["reportedBy", "reportedTo"],
//     });

//     const disabledUsers = await reportModel.findAll({
//       where: { status: "disabled" },
//       attributes: ["reportedTo"],
//     });

//     const blockedUsersIds = blockedUsers.flatMap((user) => [
//       user.reportedTo,
//       user.reportedBy,
//     ]);
//     const disabledUsersIds = disabledUsers.map((user) => user.reportedTo);

//     const excludeUserIds = [
//       ...new Set([...blockedUsersIds, ...disabledUsersIds, Number(id)]),
//     ];

//     const users = await usermodel.findAll({
//       where: {
//         id: {
//           [Op.notIn]: excludeUserIds,
//         },
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Users",
//       data: users,
//     });
//   } catch (err) {
//     console.error("Error geting user profile:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server error",
//       error: err.message,
//     });
//   }
// };

export const sendmesg = async (req, res) => {
    try {
        const body = req.body;

        const { sender_id, receiver_id, message } = body;

        if (!sender_id || !receiver_id || !message) {
            return res.status(401).json({
                success: false,
                message: "All field required",
            });
        }

        const data = await messageModel.create({
            sender_id,
            receiver_id,
            message,
        });

        console.log("data", data);

        return res.status(200).json({
            success: true,
            message: "message send successfully.",
            data: data,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
        });
    }
};

// function to merge chatlist of sender and receiver
function mergeChats(senderChat, receiverChat) {
    const allChats = [...senderChat, ...receiverChat];

    const latestChatMaps = new Map();
    console.log("latestChatMaps", latestChatMaps);
    allChats.forEach((chat) => {
        const key =
            chat.sender_id > chat.receiver_id
                ? `${chat.sender_id}-${chat.receiver_id}`
                : `${chat.receiver_id}-${chat.sender_id}`;

        const existingChat = latestChatMaps.get(key);
        // console.log("existingChat", existingChat);

        if (
            !existingChat ||
            new Date(chat.createdAt) > new Date(existingChat.createdAt)
        ) {
            latestChatMaps.set(key, chat);
        }
    });
    return Array.from(latestChatMaps.values());
}

export const chatlist = async (req, res) => {
    try {
        const { sender_id, receiver_id } = req.params;

        // Fetch chat data with latest messages first
        const senderChat = await messageModel.findAll({
            where: { sender_id },
            attributes: ["sender_id", "receiver_id", "message", "createdAt"],
            order: [["createdAt", "DESC"]], // Order by latest messages first
        });

        const receiverChat = await messageModel.findAll({
            where: { receiver_id },
            attributes: ["sender_id", "receiver_id", "message", "createdAt"],
            order: [["createdAt", "DESC"]], // Order by latest messages first
        });

        // Fetch user details for all receiver IDs
        const userdata = await usermodel.findAll({
            attributes: ["id", "name", "profileimage", "phonenumber"],
        });

        // console.log("userdata", userdata);

        const uniqueSenderChat = [];
        const uniqueReceiverChat = [];
        const seenSenders = new Set();
        const seenReceivers = new Set();

        for (const chat of senderChat) {
            if (!seenSenders.has(chat.receiver_id)) {
                seenSenders.add(chat.receiver_id);
                uniqueSenderChat.push(chat);
            }
        }

        for (const chat of receiverChat) {
            if (!seenReceivers.has(chat.receiver_id)) {
                seenReceivers.add(chat.receiver_id);
                uniqueReceiverChat.push(chat);
            }
        }

        const chats = mergeChats(uniqueSenderChat, uniqueReceiverChat);

        // Convert Sequelize instance to plain JavaScript object
        const formattedChats = chats.map((chat) => {
            // If it's a Sequelize instance, we use .get() to get the plain object
            const plainChat = chat.get ? chat.get() : chat; // Handles Sequelize instance or plain object

            // Find sender and receiver user details
            const sender = userdata.find((user) => user.id === plainChat.sender_id);
            const receiver = userdata.find(
                (user) => user.id === plainChat.receiver_id
            );

            // Add sender and receiver details to chat object
            return {
                ...plainChat,
                sender_name: sender ? sender.name : null,
                sender_profileimage: sender ? sender.profileimage : null,
                sender_phonenumber: sender ? sender.phonenumber : null,
                receiver_name: receiver ? receiver.name : null,
                receiver_profileimage: receiver ? receiver.profileimage : null,
                receiver_phonenumber: receiver ? receiver.phonenumber : null,
            };
        });

        return res.status(200).json({
            success: true,
            message: "User Chat List",
            userdata,
            chats: formattedChats,
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

export const messagehistory = async (req, res) => {
    try {
        const { sender_id, receiver_id } = req.params;

        // Fetch chat history for both sender and receiver, using OR condition
        const chatHistory = await messageModel.findAll({
            where: {
                // Match messages where sender_id and receiver_id are either in one order or the reverse
                [Op.or]: [
                    { sender_id, receiver_id },
                    { sender_id: receiver_id, receiver_id: sender_id },
                ],
            },
            attributes: ["sender_id", "receiver_id", "message", "createdAt"],
            order: [["createdAt", "desc"]],
        });

        console.log("chatHistory", chatHistory);

        // If no chat history is found
        if (!chatHistory.length) {
            return res.status(401).json({
                success: false,
                message: "User chat history is empty",
                data: null,
            });
        }

        // Return chat history
        return res.status(200).json({
            success: true,
            message: "User Chat History",
            chatHistory: chatHistory,
        });
    } catch (err) {
        console.error("Error fetching chat history:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

export const addFavorite = async (req, res) => {
    try {
        const { favoritedBy, favoritedTo } = req.body;

        if (!favoritedBy || !favoritedTo) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if the favorite relationship already exists
        const existingFavorite = await favoriteModel.findOne({
            where: { favoritedBy, favoritedTo },
        });

        if (existingFavorite) {
            return res.status(400).json({
                success: false,
                message: " this Favorite user already exists",
            });
        }

        const newFavorite = await favoriteModel.create({
            favoritedBy,
            favoritedTo,
        });

        return res.status(200).json({
            success: true,
            message: "Favorite added successfully",
            data: newFavorite,
        });
    } catch (error) {
        console.error("Error adding favorite:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const getFavorites = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetching all favorites where the user has favorited others (favoritedBy = id)
        const favorites = await favoriteModel.findAll({
            where: { favoritedBy: id }, // Filter by the user id
            include: [
                {
                    model: usermodel, // Join with the usermodel to get the details of the favorited user
                    as: "favoritedToUser", // Alias for the favorited user (not the user who favored)
                    attributes: [
                        "id",
                        "name",
                        "profileimage",
                        "Imageone",
                        "Imagetwo",
                        "Imagethree",
                        "Imagefour",
                        "Imagefive",
                        "phonenumber",
                        "email",
                        "age",
                        "gender",
                        "about",
                        "looking_for",
                        "interest",
                        "latitude",
                        "longitude",
                    ], // Specify the fields you need from favorited user
                },
            ],
        });

        // Extracting the details of the users who were favorited (favoritedTo)
        const favoriteDetails = favorites.map(
            (favorite) => favorite.favoritedToUser
        );

        return res.status(200).json({
            success: true,
            message: favoriteDetails.length
                ? "User Favorites"
                : "Your favourite list is empty",
            data: favoriteDetails, // Return only the details of the favorited users
        });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const removeFavorite = async (req, res) => {
    try {
        const { favoritedBy, favoritedTo } = req.body;

        if (!favoritedBy || !favoritedTo) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const favorite = await favoriteModel.findOne({
            where: { favoritedBy, favoritedTo },
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: "Favorite not found",
            });
        }

        await favorite.destroy();

        return res.status(200).json({
            success: true,
            message: "Favorite removed successfully",
        });
    } catch (error) {
        console.error("Error removing favorite:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

async function blockUser(reportedBy, reportedTo) { 
  try {
    await interestedModel.destroy({
      where: {
        [Op.or]: [
          { interestedBy: reportedBy, interestedTo: reportedTo },
          { interestedBy: reportedTo, interestedTo: reportedBy },
        ],
      },
    });

    await favoriteModel.destroy({
      where: {
        [Op.or]: [
          { favoritedBy: reportedBy, favoritedTo: reportedTo },
          { favoritedBy: reportedTo, favoritedTo: reportedBy },
        ],
      },
    });

    console.log("successfully removed from connection list and favorite list.");
  } catch (error) {
    console.error("Error in blockUser function:", error);
  }
}

// export const createReport = async (req, res) => {
//     try {
//       const { reportedBy, reportedTo, reason } = req.body;
  
//       if (!reportedBy || !reportedTo || !reason) {
//         return res.status(400).json({
//           success: false,
//           message: "All fields are required",
//         });
//       }
  
//       const alreadyReported = await reportModel.findOne({
//         where: {
//           [Op.and]: [{ reportedBy: reportedBy }, { reportedTo: reportedTo }],
//         },
//       });
  
//       if (alreadyReported) {
//         return res.status(400).json({
//           success: false,
//           message: "cannot report more than one time.",
//           data: [],
//         });
//       }
  
//       // Check if a report already exists
//       const existingReport = await reportModel.findOne({
//         where: { reportedTo },
//         order: [["createdAt", "DESC"]],
//       });
  
    
  
//       if (existingReport) {
//         const newReport = await reportModel.create({
//           reportedBy: reportedBy,
//           reportedTo: reportedTo,
//           reason: reason,
//           reportsCount: existingReport.reportsCount + 1,
//         });
  
//         console.log("id", existingReport.id);
  
//         if (existingReport.reportsCount + 1 >= 5) {
//           await reportModel.update(
//             { status: "disabled" },
//             { where: { reportedBy, reportedTo } }
//           );
//         }
  
//         return res.status(200).json({
//           success: true,
//           message: "Report updated successfully",
//           data: newReport,
//         });
//       } else {
//         // Create a new report if it doesn't exist
//         blockUser(reportedBy, reportedTo);
  
//         const newReport = await reportModel.create({
//           reportedBy,
//           reportedTo,
//           reason,
//         });

  
//         return res.status(200).json({
//           success: true,
//           message: "Report created successfully",
//           data: newReport,
//         });
//       }
//     } catch (error) {
//       console.error("Error creating report:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal Server Error",
//         error: error.message,
//       });
//     }
//   };

export const createReport = async (req, res) => {
    try {
      const { reportedBy, reportedTo, reason } = req.body;
  
      if (!reportedBy || !reportedTo || !reason) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }


  
      // Prevent duplicate reports from the same user to the same user
      const alreadyReported = await reportModel.findOne({
        where: {
          [Op.and]: [{ reportedBy }, { reportedTo }],
        },
      });

      console.log("alreadyReported", alreadyReported);
  
      if (alreadyReported) {
        return res.status(400).json({
          success: false,
          message: "You have already reported this user.",
          data: [],
        });
      }
  
      // Create a new report
      const newReport = await reportModel.create({
        reportedBy,
        reportedTo,
        reason,
      });

      console.log("newReport", newReport);

  
      // Count total reports for the reported user
      const reportCount = await reportModel.count({
        where: { reportedTo },
      });
  
      console.log("reportCount", reportCount);
      // Determine the new status
      const status = reportCount >= 5 ? "disable" : "enable";
  

      const statussushrut =  await StatusModel.upsert({
        userId: reportedTo,
        status: status,
        totalCount: reportCount,
      });

      console.log("Status upsert:", statussushrut );
      
  
      // Block the user (if needed)
      if (reportCount === 1) {
        blockUser(reportedBy, reportedTo);
      }
  

      return res.status(200).json({
        success: true,
        message: "Report submitted successfully",
        data: {
          report: newReport,
          status: {
            userId: reportedTo,
            status,
            totalCount: reportCount,
          },
        },
      });
    } catch (error) {
      console.error("Error creating report:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
 
  
export const addInterest = async (req, res) => {
    try {
        const { interestedBy, interestedTo } = req.body;

        if (!interestedBy || !interestedTo) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if the interest relationship already exists
        const existingInterest = await interestedModel.findOne({
            //   where: { interestedBy, interestedTo },
            where: {
                [Op.or]: [
                    { interestedBy: interestedBy, interestedTo: interestedTo },
                    { interestedBy: interestedTo, interestedTo: interestedBy },
                ],
            },
        });

        if (existingInterest) {
            return res.status(400).json({
                success: false,
                message: " this Interest user already exists",
            });
        }

        const newInterest = await interestedModel.create({
            interestedBy,
            interestedTo,
        });

        return res.status(200).json({
            success: true,
            message: "Interest added successfully",
            data: newInterest,
        });
    } catch (error) {
        console.log("Error adding interest:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


export const getInterests = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch interests along with the associated user data for 'interestedTo'
        const interests = await interestedModel.findAll({
            where: { interestedBy: id, status:"panding" },
            include: [
                {
                    model: usermodel, // Reference the User model for the interestedTo (interestedTarget)
                    as: "interestedTarget", // Alias used for the association
                    attributes: [
                        "id",
                        "name",
                        "profileimage",
                        "Imageone",
                        "Imagetwo",
                        "Imagethree",
                        "Imagefour",
                        "Imagefive",
                        "phonenumber",
                        "email",
                        "age",
                        "gender",
                        "about",
                        "looking_for",
                        "interest",
                        "latitude",
                        "longitude",
                    ],
                },
            ],
        });

        console.log("Interest records with interestedTarget data:", interests);

        // Map the results to include both the 'interest' and 'interestedTarget' data
        const interestDetails = interests.map(
            (interest) => interest.interestedTarget
        ); // Add the interestedTo data (user data)));

        return res.status(200).json({
            success: true,
            message: interestDetails.length ? "User interest" : "No interest Found",
            data: interestDetails,
        });
    } catch (error) {
        console.error("Error fetching interests:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


export const removeInterest = async (req, res) => {
    try {
        const { interestedBy, interestedTo } = req.body;

        if (!interestedBy || !interestedTo) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        const interset = await interestedModel.findOne({
            where: { interestedBy, interestedTo },
        });
        if (!interestedBy) {
            return res.status(404).json({
                success: false,
                message: "Interest not found",
            });
        }
        await interset.destroy();

        return res.status(200).json({
            success: true,
            message: "Interest removed successfully",
        });
    } catch (error) {
        console.error("Error removing interest:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


export const getInterestsOnMe = async (req, res) => {
    try {
        const { id } = req.params;

        const interests = await interestedModel.findAll({
            where: {
                interestedTo: id,
                status: "panding",
            },
            include: [
                {
                    model: usermodel,
                    as: "interestedUser",
                    attributes: [
                        "id",
                        "name",
                        "profileimage",
                        "Imageone",
                        "Imagetwo",
                        "Imagethree",
                        "Imagefour",
                        "Imagefive",
                        "phonenumber",
                        "email",
                        "age",
                        "gender",
                        "about",
                        "looking_for",
                        "interest",
                        "latitude",
                        "longitude",
                    ],
                },
            ],
        });

        const interestDetails = interests.map(
            (interest) => interest.interestedUser
        );

        return res.status(200).json({
            success: true,
            message: interestDetails.length
                ? "Users interested in you"
                : "No users have shown interest in you",
            data: interestDetails,
        });
    } catch (error) {
        console.error("Error fetching interests:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server Error",
            error: error.message,
        });
    }
};


export const rejectInterestOnMe = async (req, res) => {
    try {
        const { interestedBy, interestedTo } = req.body;

        if (!interestedBy || !interestedTo) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const interest = await interestedModel.findOne({
            where: { interestedBy, interestedTo },
        });

        if (!interest) {
            return res.status(404).json({
                success: false,
                message: "Interest not found",
            });
        }

        await interest.destroy();

        return res.status(200).json({
            success: true,
            message: "Interest rejected successfully",
        });
    } catch (error) {
        console.error("Error removing interest:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


export const acceptInterestOnMe = async (req, res) => {
    try {
        const { interestedBy, interestedTo } = req.body;

        if (!interestedBy || !interestedTo) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const interest = await interestedModel.findOne({
            where: { interestedBy, interestedTo },
        });

        if (!interest) {
            return res.status(404).json({
                success: false,
                message: "Interest not found",
            });
        }

        interest.status = "accepted";
        await interest.save();

        return res.status(200).json({
            success: true,
            message: "Interest accepted successfully",
            data: interest,
        });
    } catch (error) {
        console.error("Error accepting successfully", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

//     try {
//       const { id } = req.params;

//         const existedUser =await interestedModel.findAll({
//             where:{
//                 status:"accepted",
//                 [Op.or]:[{interestedTo:id},{interestedBy:id}]
//             }
//         });

//         if(!existedUser.length){
//             return res.status(404).json({
//                 success:false,
//                 message:"no connections found for this user.",
//                 data:[]
//             })
//         }
//         console.log("existeduser",existedUser);

//         const isInterestedTo = existedUser.some((user) => user.interestedTo == id)
//         console.log("isInterestedTo",isInterestedTo)
//         const searchColumn = isInterestedTo ? "interestedTo" : "interestedBy";
//         console.log("searchColumn",searchColumn)

//       const interests = await interestedModel.findAll({
//         where: {
//           [searchColumn]: id,
//           status:'accepted'
//         },
//         include: [
//           {
//             model: usermodel,
//             as: "interestedUser",
//             attributes: [
//               "id",
//               "name",
//               "profileimage",
//               "Imageone",
//               "Imagetwo",
//               "Imagethree",
//               "Imagefour",
//               "Imagefive",
//               "phonenumber",
//               "email",
//               "age",
//               "gender",
//               "about",
//               "looking_for",
//               "interest",
//               "latitude",
//               "longitude",
//             ],
//           },
//         ],
//       });

//       const interestDetails = interests.map(
//         (interest) => interest.interestedUser
//       );

//       return res.status(200).json({
//         success: true,
//         message: interestDetails.length
//           ? "Users interested in you"
//           : "No users have shown interest in you",
//         data: interestDetails,
//       });
//     } catch (error) {
//       console.error("Error fetching interests:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server Error",
//         error: error.message,
//       });
//     }
//   };


export const myConnections = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch all connections where the user is either interestedBy or interestedTo
        const existedUsers = await interestedModel.findAll({
            where: {
                status: "accepted",
                [Op.or]: [{ interestedTo: id }, { interestedBy: id }],
            },
        });

        if (!existedUsers.length) {
            return res.status(404).json({
                success: false,
                message: "No connections found for this user.",
                data: [],
            });
        }


        // Get all IDs where this user is either interestedBy or interestedTo
        let connectedUserIds = [];

        existedUsers.forEach((user) => {
            if (user.interestedTo == id) {
                connectedUserIds.push(user.interestedBy);
            } else if (user.interestedBy == id) {
                connectedUserIds.push(user.interestedTo);
            }
        });

        console.log("connectedUserIds", connectedUserIds);

        // Fetch user details for all connected users
        const interests = await usermodel.findAll({
            where: {
                id: { [Op.in]: connectedUserIds },
            },
            attributes: [
                "id",
                "name",
                "profileimage",
                "Imageone",
                "Imagetwo",
                "Imagethree",
                "Imagefour",
                "Imagefive",
                "phonenumber",
                "email",
                "age",
                "gender",
                "about",
                "looking_for",
                "interest",
                "latitude",
                "longitude",
            ],
        });

        return res.status(200).json({
            success: true,
            message: interests.length
                ? "Connected users found"
                : "No connected users found",
            data: interests,
        });
    } catch (error) {
        console.error("Error fetching interests:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server Error",
            error: error.message,
        });
    }
};


export const removeConnection = async (req, res) => {
    try {
        const { removeBy, removeTo } = req.body;
        // Fetch all connections where the user is either interestedBy or interestedTo
        const existedUsers = await interestedModel.findAll({
            where: {
                [Op.or]: [
                    { interestedTo: removeTo, interestedBy: removeBy },
                    { interestedTo: removeBy, interestedBy: removeTo },
                ],
            },
            attributes: ["id"],
        });

        // console.log("existedUsers", existedUsers);
        if (!existedUsers.length) {
            return res.status(404).json({
                success: false,
                message: "No connections found for this user.",
                data: [],
            });
        }
        console.log("existed", existedUsers);
        const id = existedUsers[0]?.dataValues.id;
        console.log("firstId", id);

    const data = await interestedModel.destroy({
      where: {
        id: id,
      },
    });

        // Get all IDs where this user is either interestedBy or interestedTo
        // let connectedUserIds = [];

    return res.status(200).json({
      success: true,
      message: "user deleted successfully.",
      data,
    });
  } catch (error) {
    console.error("Error fetching interests:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server Error",
      error: error.message,
    });
  }
};


 export const updatefirebaseuuid = async (req, res) => {
    try {
      const { id } = req.params;
  
      const {fcm_user_id} = req.body;
  
      console.log("Received request body:", req.body);
      console.log("Uploaded files:", req.files);
  
      if (!latitude) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
  
      const user = await usermodel.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "user not found",
        });
      }
  
      await user.update({
        fcm_user_id,
      });
  
      return res.status(200).json({
        success: true,
        message: "fuuid Updated Successfully",
        data: user,
      });
    } catch (err) {
      console.error("Error updating user fuuid:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
    }
  };


//  export const getalluser = async (req, res) => {

//    try {
//       const { id } = req.params;
//       const { gender, minAge, maxAge, latitude, longitude, maxDistance, maxCount } = req.body;

//       console.log('Request params:', req.params);
//       console.log('Request body:', req.body);
  
//       const blockedUsers = await reportModel.findAll({
//         where: { [Op.or]: [{ reportedBy: id }, { reportedTo: id }] },
//         attributes: ["reportedBy", "reportedTo"],
//       });
  
//       const disabledUsers = await reportModel.findAll({
//         where: { status: "disabled" },
//         attributes: ["reportedTo"],
//       });
  
//       const blockedUsersIds = blockedUsers.flatMap((user) => [
//         user.reportedTo,
//         user.reportedBy,
//       ]);
//       const disabledUsersIds = disabledUsers.map((user) => user.reportedTo);
  
//       const excludeUserIds = [
//         ...new Set([...blockedUsersIds, ...disabledUsersIds, Number(id)]),
//       ];
  
//        console.log('Excluded User IDs:', excludeUserIds);

//        let whereConditions = {
//         id: {
//             [Op.notIn]: excludeUserIds,
//         },
//        };

//        if (gender) {
//         whereConditions.gender = gender;
//        }

//        if (minAge || maxAge ) {
//         const currentDate = new Date();
//         const ageFilter = [];

//         if (minAge) {
//             ageFilter.push(Sequelize.where(Sequelize.fn('DATEDIFF', currentDate, Sequelize.col('age')), {
//                 [Op.gte]: minAge * 365
//             }));   
//         }
//         if (maxAge) {
//             ageFilter.push(Sequelize.where(Sequelize.fn('DATEDIFF', currentDate, Sequelize.col('age')), {
//                 [Op.lte]: maxAge * 365
//             }));
//         }

//         if ( ageFilter.length) {
//             whereConditions[Op.and] = whereConditions[Op.and] || [];

//        whereConditions[Op.and].push(Sequelize.where(
//            Sequelize.fn('ST_Distance_Sphere',
//                Sequelize.col('location'),
//                Sequelize.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`)
//            ),
//            { [Op.lte]: maxDistance * 1000 }
//        )); 

//         console.log('Final Where Conditons:', whereConditions);

//         const users = await usermodel.findAll({
//             where: whereConditions,
//             limit: maxCount || 100,
//         });

//         console.log('Users fetched:', users.length);
       
//     }
//       return res.status(200).json({
//         success: true,
//         message: "Users fetched successfully",
//         data: users,
//       });
//     } catch (err) {
//       console.error("Error geting user profile:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Internal Server error",
//         error: err.message,
//       });
//     }
//   };


export const getalluser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            gender,
            minAge,
            maxAge,
            latitude,
            longitude,
            maxDistance,
            maxCount,
            about,
            interest,
            looking_for
        } = req.body;

    
        // Validate coordinates if distance filter applied
        if ((latitude === undefined || longitude === undefined) && maxDistance) {
            return res.status(400).json({
                success: false,
                message: "Latitude and Longitude are required for distance filtering"
            });
        }

        // 1. Fetch blocked users
        const blockedUsers = await reportModel.findAll({
            where: { [Op.or]: [{ reportedBy: id }, { reportedTo: id }] },
            attributes: ["reportedBy", "reportedTo"],
        });

        const blockedUsersIds = blockedUsers.flatMap(user => [
            user.reportedBy,
            user.reportedTo,
        ]);

        // 2. Fetch disabled users from StatusModel
        const disabledUsers = await StatusModel.findAll({
            where: { status: "disable" },
            attributes: ["userId"],
        });

        const disabledUserIds = disabledUsers.map(user => user.userId);

        // 3. Exclude blocked + disabled + self
        const excludeUserIds = [...new Set([...blockedUsersIds, ...disabledUserIds, Number(id)])];
        console.log('Excluded User IDs:', excludeUserIds);

        // 4. Where clause base
        const whereConditions = {
            id: { [Op.notIn]: excludeUserIds },
        };

        if (gender) whereConditions.gender = gender;

        if (minAge || maxAge) {
            whereConditions.age = {};
            if (minAge) whereConditions.age[Op.gte] = minAge;
            if (maxAge) whereConditions.age[Op.lte] = maxAge;
        }

        if (about) {
            whereConditions.about = { [Op.like]: `%${about}%` };
        }

        if (interest) {
            whereConditions.interest = { [Op.like]: `%${interest}%` };
        }

        if (looking_for) {
            whereConditions.looking_for = { [Op.like]: `%${looking_for}%` };
        }

        console.log('Final Where Conditions:', whereConditions);

        // 5. Attributes to return
        const attributes = [
            "id",
            "name",
            "profileimage",
            "latitude",
            "longitude",
            "age",
            "about",
            "interest",
            "looking_for",
        ];

        // 6. Distance logic
        if (latitude !== undefined && longitude !== undefined) {
            attributes.push([
                Sequelize.literal(`ST_Distance_Sphere(
                    POINT(${longitude}, ${latitude}),
                    POINT(CAST(longitude AS DECIMAL(10, 6)), CAST(latitude AS DECIMAL(10, 6)))
                ) / 1000`), // convert to km
                "distance"
            ]);
        }

        // 7. Final query
        const users = await usermodel.findAll({
            where: whereConditions,
            attributes,
            ...(latitude !== undefined && longitude !== undefined && {
                having: Sequelize.literal(`distance <= ${maxDistance || 10000}`),
                order: Sequelize.literal("distance ASC"),
            }),
            limit: maxCount || 100,
        });

        console.log('Users fetched:', users.length);

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users,
        });

    } catch (err) {
        console.error("Error getting user profile:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
};



// export const getalluser = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const {
//             gender,
//             minAge,
//             maxAge,
//             latitude,
//             longitude,
//             maxDistance,
//             maxCount,
//             about,
//             interest,
//             looking_for
//         } = req.body;

//         console.log('Request params:', req.params);
//         console.log('Request body:', req.body);

//         // Validate location if required for distance
        
//         if ((latitude === undefined || longitude === undefined) && maxDistance) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Latitude and Longitude are required for distance filtering"
//             });
//         }

//         // Fetch blocked and disabled users
//         const blockedUsers = await reportModel.findAll({
//             where: { [Op.or]: [{ reportedBy: id }, { reportedTo: id }] },
//             attributes: ["reportedBy", "reportedTo"],
//         });

//         const disabledUsers = await reportModel.findAll({
//             where: { status: "disabled" },
//             attributes: ["reportedTo"],
//         });

//         const blockedUsersIds = blockedUsers.flatMap(user => [
//             user.reportedBy,
//             user.reportedTo,
//         ]);

//         const disabledUsersIds = disabledUsers.map(user => user.reportedTo);

//         const excludeUserIds = [
//             ...new Set([...blockedUsersIds, ...disabledUsersIds, Number(id)]),
//         ];

//         console.log('Excluded User IDs:', excludeUserIds);

//         // Build where conditions
//         const whereConditions = {
//             id: { [Op.notIn]: excludeUserIds },
//         };

//         if (gender) whereConditions.gender = gender;

//         if (minAge || maxAge) {
//             const ageCondition = {};
//             if (minAge) ageCondition[Op.gte] = minAge;
//             if (maxAge) ageCondition[Op.lte] = maxAge;

//             whereConditions.age = ageCondition;
//         }

//         if (about) {
//             whereConditions.about = { [Op.like]: `%${about}%` };
//         }

//         if (interest) {
//             whereConditions.interest = { [Op.like]: `%${interest}%` };
//         }

//         if (looking_for) {
//             whereConditions.looking_for = { [Op.like]: `%${looking_for}%` };
//         }

//         console.log('Final Where Conditions:', whereConditions);
//         console.log('Latitude:', latitude, 'Longitude:', longitude);
//         console.log('Max Distance:', maxDistance);

//         const attributes = [
//             "id",
//             "name",
//             "profileimage",
//             "latitude",
//             "longitude",
//             "age",
//             "about",
//             "interest",
//             "looking_for"
//         ];

//         // Add distance calculation only if lat/lng provided
//         if (latitude !== undefined && longitude !== undefined) {
//             attributes.push([
//                 Sequelize.literal(`ST_Distance_Sphere(
//                     POINT(${longitude}, ${latitude}),
//                     POINT(longitude, latitude)
//                 ) / 1000`),
//                 "distance"
//             ]);
//         }

//         // Main query
//         const users = await usermodel.findAll({
//             where: whereConditions,
//             attributes,
//             ...(latitude !== undefined && longitude !== undefined && {
//                 having: Sequelize.literal(`distance <= ${maxDistance || 10000}`),
//                 order: Sequelize.literal("distance ASC"),
//             }),
//             limit: maxCount || 100,
//         });

//         console.log('Users fetched:', users.length);

//         return res.status(200).json({
//             success: true,
//             message: "Users fetched successfully",
//             data: users,
//         });
//     } catch (err) {
//         console.error("Error getting user profile:", err);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: err.message,
//         });
//     }
// };


export const initiatePayment = async (req, res) => {
    try {
        const { userId, amount, productInfo, email, phone } = req.body;

        const transactionId = `TXN${Date.now()}`;

        const hashString = `${payuConfig.key}|${transactionId}|${amount}|${productInfo}|${email}|${phone}|||||||||||${payuConfig.salt}`;
        const hash = crypto.createHash("sha512").update(hashString).digest("hex");

        // Save to DB
        await PayUModel.create({
            userId,
            transactionId,
            amount,
            status: "pending",
            productInfo,
            email,
            phonenumber: phone,
            hash,
        });

        // Send payment data to frontend
        const paymentData = {
            key: payuConfig.key,
            txnid: transactionId,
            amount,
            productinfo: productInfo,
            firstname: email.split("@")[0], // extract name from email
            email,
            phone,
            surl: payuConfig.successUrl,
            furl: payuConfig.failureUrl,
            hash,
        };

        return res.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            paymentData,
            payuUrl: `${payuConfig.baseUrl}/_payment`,
        });

    } catch (error) {
        console.error("Error initiating payment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


export const handleWebhook = async (req, res) => {
    try {
        const {
            txnid,
            status,
            hash, 
            mode,
            amount,
            productinfo,
            email,
            firstname
        } = req.body;

        // Log received data for debugging
        console.log("Received Webhook:", req.body);

        // Generate the reverse hash string as per PayU specs
        const hashString = `${payuConfig.salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${payuConfig.key}`;
        const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");
        
        // Validate the hash
        if (hash !== calculatedHash) {
            console.error("Invalid hash. Expected:", calculatedHash);
            return res.status(400).json({
                success: false,
                message: "Invalid hash",
            });
        }

        // Update payment status in DB
        const updated = await PayUModel.update(
            {
                status,
                paymentMode: mode,
                hash,
            },
            {
                where: { transactionId: txnid },
            }
        );

        if (updated[0] === 0) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Transaction status updated successfully",
        });

    } catch (error) {
        console.error("Error in webhook handler:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


export const createSubscription =async (req,res) => {
    try {
        const { userId, planeName, amount, durationInDays } = req.body;

        if (!userId || !planeName || !amount || !durationInDays) { 
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // check if the user exists
        const user = await usermodel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // calculate the end date based on the duration
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + durationInDays);

        // create the subscription
        const subscription = await SubscriptionModel.create({
            userId,
            planeName,
            amount,
            startDate,
            endDate,
        });

        return res.status(201).json({
            success: true,
            message: "Subscription created successfully",
            data: subscription,
        });
    } catch (error) {
        console.error("Error creating subscription:" , error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

// Get all subscrptions for a user

export const getSubscriptions = async (req,res) => {
    try{
        const { userId } = req.params;

        // Fetch subscriptions for the user
        const subscription = await SubscriptionModel.findAll({
            where: { userId },
        });

        if (!subscription.length) {
            return res.status(404).json({
                success: false,
                message: "No subscriptions found for this user",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User subsriptions fetched successfully",
            data: subscription,
        });
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


export const UserUnblock = async (req,res) => {
    try {
        const { reportedBy, reportedTo } = req.body;

        if (!reportedBy || !reportedTo ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // check if a report exists
        const existingReport = await reportModel.findOne({
            where: {
                reportedBy,

                
                reportedTo,
            }
        }); 

        console.log("existingReport", existingReport);

        if (!existingReport) {
            return res.status(404).json({
                success: false,
                message: "No block record found for this user",
            })
        }

        // check if the user is disabled
        if (!existingReport . status === "disabled") {
            return res.status(403).json({
                success: false,
                message: "User is disabled and cannot be unblocked",
            });
        }

        // // check if the reportsCount is less than 3
        if (existingReport.reportsCount >= 5) {
            return res.status(403).json({
                success: false,
                message: "User caanot be unblocked due to high report count",
            });
        }

        // // update the report status to "active" and reset the reportsCount
        await reportModel.update(
            { where: { reportedBy, reportedTo } },
            { status: "active", reportsCount: 0 },
             
        );
        
    } catch (error) {
        console.error("Error unblocking user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


export const chatBlockUser = async (req, res) => {
    try {
        const { sender_id, receiver_id, message } = req.body;

        if (!sender_id || !receiver_id || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields (sender_id, receiver_id, message) are required.",
            });
        }

        // Check if either user has blocked the other
        const blockExists = await reportModel.findOne({
            where: {
                [Op.or]: [
                    { reportedBy: sender_id, reportedTo: receiver_id },
                    { reportedBy: receiver_id, reportedTo: sender_id },
                ],
                status: "blocked", // make sure this matches your actual DB value exactly
            },
        });

        console.log("Block record found:", blockExists); // Helpful debug line

        // Prevent sending message if block record exists
        if (blockExists) {
            console.log("Blocked detected:", blockExists); // Helpful debug line
            return res.status(403).json({
                success: false,
                message: `Messaging is not allowed. One user has blocked the other.`,
            });
        }

        // If no block exists, proceed with message
        const newMessage = await messageModel.create({
            sender_id,
            receiver_id,
            message,
        });

        return res.status(200).json({
            success: true,
            message: "Message sent successfully.",
            data: newMessage,
        });

    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
            error: error.message,
        });
    }
};
        
export const logoutUser = async (req,res) => {
    try {
        if(!req.session) {
            return res.status(400).json({
                success: false,
                message: "No active session found.",
            });
        }
         
        console.log("req.session", req.session);
        
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
               console.error("Error destroying session:", err);
               return res.status(500).json({
                success: false,
                message: "Failed to destroy session.",
                error: err.message,
               });
            }

            // Clear the session cookie
            res.clearCookie("connect.sid");

            return res.status(200).json({
                success: true,
                message: "Session destroyed successfully. User logged out.",
            });
        });
    } catch (error) {
        console.error("Error in logoutUser API:", error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


