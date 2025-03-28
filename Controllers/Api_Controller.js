import usermodel from "../Model/UserModel.js";
import blockedmodel from "../Model/BlockedModel.js";
import { Op } from "sequelize";
import { Sequelize } from "sequelize";
import path from "path";
import { error } from "console";
import messageModel from "../Model/messageModel.js";
import exp from "constants";
import reportModel from "../Model/reportModel.js";
import favoriteModel from "../Model/FavoriteModel.js";
import interestedModel from "../Model/IntrestedModel.js";

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
            !longitude
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
    const body = req.body;

    const { phonenumber } = body;

    if (!phonenumber) {
        return res.status(401).json({
            success: false,
            message: "Phone number required",
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
        message: "Logged In Successfully.",
        data: userlogin,
    });
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

// export const getalluser = async (req, res) => {
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

export const createReport = async (req, res) => {
    try {
      const { reportedBy, reportedTo, reason } = req.body;
  
      if (!reportedBy || !reportedTo || !reason) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
  
      const alreadyReported = await reportModel.findOne({
        where: {
          [Op.and]: [{ reportedBy: reportedBy }, { reportedTo: reportedTo }],
        },
      });
  
      if (alreadyReported) {
        return res.status(400).json({
          success: false,
          message: "cannot report more than one time.",
          data: [],
        });
      }
  
      // Check if a report already exists
      const existingReport = await reportModel.findOne({
        where: { reportedTo },
        order: [["createdAt", "DESC"]],
      });
  
      // console.log("countss", existingReport.reportsCount + 1);
  
      if (existingReport) {
        const newReport = await reportModel.create({
          reportedBy: reportedBy,
          reportedTo: reportedTo,
          reason: reason,
          reportsCount: existingReport.reportsCount + 1,
        });
  
        console.log("id", existingReport.id);
  
        if (existingReport.reportsCount + 1 >= 3) {
          await reportModel.update(
            { status: "disabled" },
            { where: { reportedBy, reportedTo } }
          );
        }
  
        return res.status(200).json({
          success: true,
          message: "Report updated successfully",
          data: newReport,
        });
      } else {
        // Create a new report if it doesn't exist
        blockUser(reportedBy, reportedTo);
  
        const newReport = await reportModel.create({
          reportedBy,
          reportedTo,
          reason,
        });
  
        return res.status(200).json({
          success: true,
          message: "Report created successfully",
          data: newReport,
        });
      }
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
            where: { interestedBy: id },
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

// export const myConnections = async (req, res) => {
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


export const getalluser = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Extract filters from the request body or query
      const { gender, minAge, maxAge, latitude, longitude, maxDistance, maxCount } = req.body;
  
      // Get blocked users
      const blockedUsers = await reportModel.findAll({
        where: { [Op.or]: [{ reportedBy: id }, { reportedTo: id }] },
        attributes: ["reportedBy", "reportedTo"],
      });
  
      // Get disabled users >>>>
      const disabledUsers = await reportModel.findAll({
        where: { status: "disabled" },
        attributes: ["reportedTo"],
      });
  
      const blockedUsersIds = blockedUsers.flatMap((user) => [user.reportedTo, user.reportedBy]);
      const disabledUsersIds = disabledUsers.map((user) => user.reportedTo);
  
      const excludeUserIds = [
        ...new Set([...blockedUsersIds, ...disabledUsersIds, Number(id)]),
      ];

      console.log('Excluded User ID:', excludeUserIds);
  
      // Build where conditions dynamically
      let whereConditions = {
        id: {
          [Op.notIn]: excludeUserIds,
        },
      };
  
      if (gender) {
        whereConditions.gender = gender; // Filter by gender (male or female)
      }
  
      if (minAge || maxAge) {
        const currentDate = new Date();
        const ageFilter = [];
        
        if (minAge) {
          ageFilter.push(Sequelize.where(Sequelize.fn('DATEDIFF', currentDate, Sequelize.col('age')), {
            [Op.gte]: minAge * 365 // Approximate age by days
          }));
        }
        if (maxAge) {
          ageFilter.push(Sequelize.where(Sequelize.fn('DATEDIFF', currentDate, Sequelize.col('age')), {
            [Op.lte]: maxAge * 365 // Approximate age by days
          }));
        }
  
        if (ageFilter.length) {
          whereConditions[Op.and] = ageFilter;
        }
      }
  
      if (latitude && longitude && maxDistance) {
        whereConditions[Op.and] = whereConditions[Op.and] || [];
  
        // Add distance calculation condition (using geolib's getDistance function or a similar method)
        whereConditions[Op.and].push(Sequelize.where(
          Sequelize.fn('ST_DistanceSphere',
            Sequelize.col('location'), // Assuming 'location' column stores the lat/lng as a POINT
            Sequelize.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`)
          ),
          { [Op.lte]: maxDistance * 1000 } // Convert distance to meters (geolib returns meters)
        ));
      }
  
      // Fetch users with the applied filters
      const users = await usermodel.findAll({
        where: whereConditions,
        limit: maxCount || 100, // Default to 100 if maxCount is not provided
      });
  
      return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users,
      });

    } catch (err) {
      console.error("Error getting user profile:", err);
      return res.status(500).json({
        success: false,
        message: "Internal Server error",
        error: err.message,
      });

    }
  };




