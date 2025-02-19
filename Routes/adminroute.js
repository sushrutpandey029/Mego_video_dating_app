import express from 'express';

import { AdminRegister } from '../Controllers/Admin_Controller.js';

const adminrouter = express.Router();

// router.get('/',(req,res)=>{
//     return res.status(200).json({
//         success:true,
//         message:"data insert successfully",
//     })
// })

adminrouter.post('/adminRegister',AdminRegister)

export default adminrouter;