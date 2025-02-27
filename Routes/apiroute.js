import express from 'express'

import {userregister, userlogin, updateuserprofile,getalluser,
     updatelocation, getuserprofile,sendmesg,chatlist,messagehistory} from '../Controllers/Api_Controller.js'

import upload from '../Middlewares/ProfileUpload.js'

const router = express.Router();

router.get('/',(req,res)=>{
    return res.status(200).json({
        success:true,
        message:"data insert successfully",
    })
})

router.post('/insertuser', upload.single('profileimage'), userregister);

router.get('/userlogin', userlogin);

router.put('/updateuserprofile/:id',upload.fields([
    { name: 'profileimage', maxCount: 1 },
    { name: 'Imageone', maxCount: 1 },
    { name: 'Imagetwo', maxCount: 1 },
    { name: 'Imagethree', maxCount: 1 },
    { name: 'Imagefour', maxCount: 1 },
    { name: 'Imagefive', maxCount: 1 }

]),updateuserprofile);

router.put('/updatelocation/:id',updatelocation);

router.get('/getuserprofile/:id', getuserprofile);

router.get('/getalluser', getalluser);
router.post('/sendmesg', sendmesg);

router.get('/chatlist/:sender_id', chatlist);
router.get('/messagehistory/:sender_id/:receiver_id', messagehistory);


export default router;