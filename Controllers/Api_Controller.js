import usermodel from '../Model/UserModel.js'
import blockedmodel from '../Model/BlockedModel.js'
import { Op } from 'sequelize';
import path from 'path';
import { error } from 'console';
import messageModel from '../Model/messageModel.js'
import exp from 'constants';
import reportModel from '../Model/reportModel.js'
import favoriteModel from '../Model/FavoriteModel.js'


export const userregister = async (req, res) => {
    try {
        const body = req.body;

        const { phonenumber, name, email, age, gender, about,
            relationship, interest, latitude, longitude } = body

        let profileimage = null;

        console.log("body data", body)

        if (!phonenumber || !name || !email || !age || !gender || !relationship || !interest || !relationship || !latitude || !longitude) {
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
        message: "Logged In Successfully.",
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
// export const chatlist = async (req, res) => {
//     try {
//         const { sender_id, receiver_id } = req.params;

//         // Fetch chat data with latest messages first
//         const senderChat = await messageModel.findAll({
//             where: { sender_id },
//             attributes: ["sender_id", "receiver_id", "message", "createdAt"],
//             order: [["createdAt", "DESC"]], // Order by latest messages first
//         });

//         const receiverChat = await messageModel.findAll({
//             where: { receiver_id },
//             attributes: ["sender_id", "receiver_id", "message", "createdAt"],
//             order: [["createdAt", "DESC"]], // Order by latest messages first
//         });

//         // Fetch user details for all receiver IDs
//         const userdata = await usermodel.findAll({
//             attributes: ["id", "name", "profileimage", "phonenumber"],
//         });

//         console.log("userdata", userdata);

//         const uniqueSenderChat = [];
//         const uniqueReceiverChat = [];
//         const seenSenders = new Set();
//         const seenReceivers = new Set();

//         for (const chat of senderChat) {
//             if (!seenSenders.has(chat.receiver_id)) {
//                 seenSenders.add(chat.receiver_id);
//                 uniqueSenderChat.push(chat);
//             }
//         }

//         for (const chat of receiverChat) {
//             if (!seenReceivers.has(chat.receiver_id)) {
//                 seenReceivers.add(chat.receiver_id);
//                 uniqueReceiverChat.push(chat);
//             }
//         }

//         const chats = mergeChats(uniqueSenderChat, uniqueReceiverChat);

//         // Convert Sequelize instance to plain JavaScript object
//         const formattedChats = chats.map((chat) => {
//             // If it's a Sequelize instance, we use .get() to get the plain object
//             const plainChat = chat.get ? chat.get() : chat;  // Handles Sequelize instance or plain object
//             console.log("plainchat",plainChat)

//             const user = userdata.find((user) => user.id === plainChat.receiver_id);
//             console.log("user",user)

//             if (user) {
//                 return {
//                     ...plainChat,
//                     name: user.name,
//                     profileimage: user.profileimage,
//                     phonenumber: user.phonenumber,
//                 };
//             }

//             return plainChat;
//         });

//         return res.status(200).json({
//             success: true,
//             message: "User Chat List",
//             chats: formattedChats,
//         });
//     } catch (error) {
//         console.error("Error fetching chat list:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message,
//         });
//     }
// };

// export const chatlist = async (req, res) => {
//     try {
//       const { sender_id,  receiver_id } = req.params;

//       // Fetch chat data with latest messages first
//       const senderChat = await messageModel.findAll({
//         where: { sender_id },
//         attributes: ["sender_id", "receiver_id", "message","createdAt"],
//         order: [["createdAt", "DESC"]], // Order by latest messages first
//       });

//       const receiverChat = await messageModel.findAll({
//         where: {  receiver_id },
//         attributes: [ "sender_id", "receiver_id", "message", "createdAt"],
//         order: [["createdAt", "DESC"]], // Order by latest messages first
//       });

//        // Fetch user details for all receiver IDs
//        const userdata = await usermodel.findAll({
//         attributes: ["id","name", "profileimage", "phonenumber"]
//     });

//      console.log("userdata", userdata);

//       const uniqueSenderChat = [];
//       const uniqueReceiverChat = [];
//       const seenSenders = new Set();
//       const seenReceivers = new Set();

//       for (const chat of senderChat) {
//         if (!seenSenders.has(chat.receiver_id)) {
//           seenSenders.add(chat.receiver_id);
//           uniqueSenderChat.push(chat);
//         }
//       }

//       for (const chat of receiverChat) {
//         if (!seenReceivers.has(chat.receiver_id)) {
//           seenReceivers.add(chat.receiver_id);
//           uniqueReceiverChat.push(chat);
//         }
//       }

//       const chats = mergeChats(uniqueSenderChat, uniqueReceiverChat);

//        // Add user details to each chat
//        const formattedChats = chats.map((chat) => {
//         const user = userdata.find((user) => user.id === chat.receiver_id);

//         if (user) {
//           return {
//             ...chat,
//             name: user.name,
//             profileimage: user.profileimage,
//             phonenumber: user.phonenumber,
//           };
//         }
//         return chat;
//       });

//       return res.status(200).json({
//         success: true,
//         message: "User Chat List",
//         userdata,
//         chats:formattedChats,
//       });
//     } catch (error) {
//       console.error("Error fetching chat list:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal Server Error",
//         error: error.message,
//       });
//     }
//   };

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

        console.log("userdata", userdata);

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
            const plainChat = chat.get ? chat.get() : chat;  // Handles Sequelize instance or plain object

            // Find sender and receiver user details
            const sender = userdata.find((user) => user.id === plainChat.sender_id);
            const receiver = userdata.find((user) => user.id === plainChat.receiver_id);

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
                    { sender_id: receiver_id, receiver_id: sender_id }
                ]
            },
            attributes: ["sender_id", "receiver_id", "message", "createdAt"],
            order: [["createdAt", "desc"]]
        });

        console.log("chatHistory", chatHistory);

        // If no chat history is found
        if (!chatHistory.length) {
            return res.status(401).json({
                success: false,
                message: "User chat history is empty",
                data: null
            });
        }

        // Return chat history
        return res.status(200).json({
            success: true,
            message: "User Chat History",
            chatHistory: chatHistory
        });
    } catch (err) {
        console.error("Error fetching chat history:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};


// export const blockuser = async (req,res) =>{

//     const body = req.body

//     const {blockedby, blockedto, status} = body

// }




export const addFavorite = async (req, res) => {
    try {
        const { favoritedBy, favoritedTo } = req.body;

        if (!favoritedBy || !favoritedTo) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newFavorite = await favoriteModel.create({
            favoritedBy,
            favoritedTo
        });

        return res.status(200).json({
            success: true,
            message: "Favorite added successfully",
            data: newFavorite
        });
    } catch (error) {
        console.error("Error adding favorite:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

//  export const getFavorites = async (req,res) => {
//     try{
//         const { id } = req.params;
//         const favorites = await favoriteModel.findAll({
//             where: { favoritedBy:id},
//             include: [{
//                 model: usermodel,
//                 as : 'favoritedUser',
//                 attributes: ['id', 'name', 'profileimage', 'phonenumber']
//             }]
//         });

//         return res.status(200).json({
//             success: true,
//             message: "User Favorites",
//             data: favorites
//         });
//     } catch (error){
//         console.error("Error fetching favorites:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
//  }

// export const getFavorites = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Fetching all favorites where the user has favorited others (favoritedBy = id)
//         const favorites = await favoriteModel.findAll({
//             where: { favoritedBy: id }, // Filter by the user id
//             include: [{
//                 model: usermodel,  // Join with the usermodel to get the details of the favorited user
//                 as: 'favoritedToUser',  // Alias for the favorited user (not the user who favored)
//                 attributes: ['id', 'name', 'profileimage', 'phonenumber']  // Specify the fields you need from favorited user
//             }]
//         });

//         // Extracting the details of the users who were favorited (favoritedTo)
//         const favoriteDetails = favorites.map(favorite => favorite.favoritedToUser);

//         return res.status(200).json({
//             success: true,
//             message: favoriteDetails.length ? "User Favorites" : "Your favourite list is empty",
//             data: favoriteDetails // Return only the details of the favorited users
//         });

//     } catch (error) {
//         console.error("Error fetching favorites:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// };


export const getFavorites = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetching all favorites where the user has favorited others (favoritedBy = id)
        const favorites = await favoriteModel.findAll({
            where: { favoritedBy: id }, // Filter by the user id
            include: [{
                model: usermodel,  // Join with the usermodel to get the details of the favorited user
                as: 'favoritedToUser',  // Alias for the favorited user (not the user who favored)
                attributes: ['id', 'name', 'profileimage', 'phonenumber', 'email', 'age', 'gender', 'about', 'looking_for', 'interest', 'latitude', 'longitude']  // Specify the fields you need from favorited user
            }]
        });

        // Extracting the details of the users who were favorited (favoritedTo)
        const favoriteDetails = favorites.map(favorite => favorite.favoritedToUser);

        return res.status(200).json({
            success: true,
            message: favoriteDetails.length ? "User Favorites" : "Your favourite list is empty",
            data: favoriteDetails // Return only the details of the favorited users
        });

    } catch (error) {
        console.error("Error fetching favorites:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const removeFavorite = async (req, res) => {
    try{
        const { favoritedBy, favoritedTo } = req.body;

        if(!favoritedBy || !favoritedTo) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const favorite = await favoriteModel.findOne({
            where: { favoritedBy, favoritedTo}
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: "Favorite not found"
            });
        }

        await favorite.destroy();

        return res.status(200).json({
            success: true,
            message: "Favorite removed successfully"
        });
    } catch (error) {
        console.error("Error removing favorite:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const createReport = async (req, res) => {
    try {
        const { reportedBy, reportedTo, reason } = req.body;

        if (!reportedBy || !reportedTo || !reason) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if a report already exists
        const existingReport = await reportModel.findOne({
            where: { reportedBy, reportedTo }
        });

        if (existingReport) {
            // Increment the reportsCount if the report already exists
            existingReport.reportsCount += 1;
            await existingReport.save();

            return res.status(200).json({
                success: true,
                message: "Report updated successfully",
                data: existingReport
            });
        } else {
            // Create a new report if it doesn't exist
            const newReport = await reportModel.create({
                reportedBy,
                reportedTo,
                reason,
                // reportsCount: 1 // Initialize reportsCount to 1
            });

            return res.status(200).json({
                success: true,
                message: "Report created successfully",
                data: newReport
            });

            
        }
    } catch (error) {
        console.error("Error creating report:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};