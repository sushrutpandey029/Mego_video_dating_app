import adminModel from '../Model/AdminModel.js'
import bcrypt from 'bcrypt'

export const AdminRegister = async (req, res) => {
    try {
        const { fullname, email, password, phoneNumber } = req.body;
        // Validate input
        if (!fullname || !email || !password || !phoneNumber) {
            return res.status(401).json({ errormessage: "All field are required"});
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
            success:true,
            message: "Admin created successfully",
            data: newAdmin
        });

    } catch(err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err.message,
        });
    }

};

