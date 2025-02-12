import usermodel from '../Model/UserModel.js'

export const userregister = async (req, res) => {
    try {
        const body = req.body;
        const { phonenumber, name, email, age, gender,
            relationship, interest, profileimage,
            Imageone, Imagetwo, Imagethree, Imagefour,
            Imagefive, latitude, longitude } = body


        if (!phonenumber || !name || !email || !age || !gender || !relationship || !interest || !profileimage || !latitude || !longitude) {
            return res.status(401).json({
                success: false,
                message: "All filed are required"
            })
        }

        // Validate phone number
        const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
        if (phonenumber && !phoneRegex.test(phonenumber)) {
            return res.status(400).json({
                status: false,
                message: "Mobile number is not valid",
            });
        }

          // Check for duplicate email
          const isDuplicatephone = await usermodel.findOne({ where: { phonenumber } });
          if (isDuplicatephone) {
             return res.status(401).json({
                 success:false,
                 message:"Phone is allready in Use"
             })
          }
 

         // Validate email format
         const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;
         if (!emailRegex.test(email)) {
            return res.status(401).json({
                success:false,
                message:"Email is not validate"
            })
         }
 
         // Check for duplicate email
         const isDuplicateEmail = await usermodel.findOne({ where: { email } });
         if (isDuplicateEmail) {
            return res.status(401).json({
                success:false,
                message:"Email is allready in Use"
            })
         }


        const data = new usermodel({
            phonenumber,
            name,
            email,
            age,
            gender,
            looking_for: relationship,
            interest,
            profileimage,
            Imageone,
            Imagetwo,
            Imagethree,
            Imagefour,
            Imagefive,
            latitude,
            longitude
        })

        const Create = await data.save();

        return res.status(200).json({
            success:true,
            message:"data insert successfully",
            data:Create
        })
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Internal server err", err
        })
    }
}