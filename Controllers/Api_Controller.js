import usermodel from '../Model/UserModel.js'
import path from 'path';

export const userregister = async (req, res) => {
    try {
        const body = req.body;

        const { phonenumber, name, email, age, gender,about,
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
}

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
  
    return res.status(201).json({
        success: true,
        message: "users",
        data: userlogin
    })

}


