import express from 'express'

import {userregister, userlogin} from '../Controllers/Api_Controller.js'

import upload from '../Middlewares/ProfileUpload.js'

const router = express.Router();

router.get('/',(req,res)=>{
    return res.status(200).json({
        success:true,
        message:"data insert successfully",
    })
})

router.post('/insertuser', upload.single('profileimage'), userregister)

router.post('/userlogin', userlogin);


export default router;