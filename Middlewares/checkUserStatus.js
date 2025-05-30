import StatusModel from "../Model/StatusModel.js";

// const checkUserStatus = async (req, res, next) => {
//   try {
//     // console.log("req.user", req.session);

//     const userId = req.session.id; // Assuming `req.user` is populated by a token middleware like `verifyToken`
//     console.log("userId", userId);



//     // if (!userId) {
//     //   return res.status(401).json({
//     //     success: false,
//     //     message: "Unauthorized access. User ID not found.",
//     //   });
//     // }

//     // Check the user's status in the database
//     // const userStatus = await StatusModel.findOne({ where: { userId } });

//     // if (!userStatus) {
//     //   return res.status(404).json({
//     //     success: false,
//     //     message: "User status not found.",
//     //   });
//     // }

//     // if (userStatus.status === "disable") {
//     //   return res.status(403).json({
//     //     success: false,
//     //     message: "Your account is disabled. Please contact support.",
//     //   });
//     // }

//     // If the user is enabled, proceed to the next middleware or route
//     // next();
//   } catch (error) {
//     console.error("Error checking user status:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

const checkUserStatus = async (req, res, next) => {
  try {
    const userId = req.session?.user?.id;
    console.log("userId", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. User ID not found in session.",
      });
    }

    const userStatus = await StatusModel.findOne({ where: { userId } });

    if (!userStatus) {
      next();
    } else {
      if (userStatus.status === "disable") {
        return res.status(403).json({
          success: false,
          message: "Your account is disabled. Please contact support.",
        });
      }
    }



    // next();
  } catch (error) {
    console.error("Error checking user status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export default checkUserStatus;