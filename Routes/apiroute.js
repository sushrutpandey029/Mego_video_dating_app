import express from 'express'

import {userregister} from '../Controllers/Api_Controller.js'

const router = express.Router();

// router.get('/',(req,res)=>{
//     return res.status(200).json({
//         success:true,
//         message:"data insert successfully",
//     })
// })

router.post('/insertuser',userregister)


export default router;