import express from 'express'
import verifyToken from "../Middlewares/verifyToken.js"; // Correct path for verifyToken.js
import checkUserStatus from "../Middlewares/checkUserStatus.js"; // Correct path for checkUserStatus.js

import {userregister, userlogin, updateuserprofile,getalluser,
       updatelocation, getuserprofile,sendmesg,chatlist,messagehistory,createReport,
       addFavorite,getFavorites,removeFavorite,addInterest,getInterests,
       removeInterest,getInterestsOnMe,rejectInterestOnMe,acceptInterestOnMe,myConnections,
       removeConnection,initiatePayment,handleWebhook,createSubscription,getSubscriptions,
       UserUnblock,chatBlockUser,
       logoutUser} from '../Controllers/Api_Controller.js'
import upload from '../Middlewares/ProfileUpload.js'
import {generateAgoraToken} from '../Controllers/agoraToken.js'


const router = express.Router();

router.get('/',(req,res)=>{
    return res.status(200).json({
        success:true,
        message:"data insert successfully",
    })
})

router.post('/insertuser', upload.single('profileimage'), userregister);

router.get('/userlogin',  userlogin);

router.put('/updateuserprofile/:id',checkUserStatus, upload.fields([
    { name: 'profileimage', maxCount: 1 },
    { name: 'Imageone', maxCount: 1 },
    { name: 'Imagetwo', maxCount: 1 },
    { name: 'Imagethree', maxCount: 1 },
    { name: 'Imagefour', maxCount: 1 },
    { name: 'Imagefive', maxCount: 1 }

]),updateuserprofile);

router.put('/updatelocation/:id',  checkUserStatus,updatelocation);

router.get('/getuserprofile/:id',  checkUserStatus, getuserprofile);

router.get('/getalluser/:id',   checkUserStatus,getalluser);

router.post('/sendmesg', checkUserStatus,sendmesg);

router.post('/checkBlock', checkUserStatus,chatBlockUser);

router.get('/chatlist/:sender_id/:receiver_id', checkUserStatus,chatlist);

router.get('/messagehistory/:sender_id/:receiver_id', checkUserStatus,messagehistory);

router.post('/favorite', checkUserStatus, addFavorite);

router.get('/favorites/:id',checkUserStatus,getFavorites);

router.delete('/removefavorite',   checkUserStatus,removeFavorite);

router.post('/interest',  checkUserStatus, addInterest);

router.get('/interests/:id',checkUserStatus, getInterests);

router.delete('/removeinterest',   checkUserStatus,removeInterest);

router.get('/interestOnMe/:id',   checkUserStatus,getInterestsOnMe);

router.delete('/rejectinterestOnMe',   checkUserStatus,rejectInterestOnMe );

router.post('/acceptinterestOnMe',   checkUserStatus,acceptInterestOnMe);

router.get('/myconnections/:id',  checkUserStatus,myConnections);
router.delete('/removeconnection',  checkUserStatus,removeConnection);

router.post("/generate-token",  checkUserStatus, generateAgoraToken);

// router.put("/generate-f_uuid/:id", updatefirebaseuuid);

router.post('/report',   checkUserStatus, createReport);

router.post("/payu/initiate",   checkUserStatus,initiatePayment);

router.post("/payu/webhook",   checkUserStatus,handleWebhook);

router.post("/subscriptions",   checkUserStatus,createSubscription);

router.get("/getMySubscription/:userId",   checkUserStatus,getSubscriptions);

router.post("/unblock",  checkUserStatus, UserUnblock);

router.post("/logout/:userId", checkUserStatus, logoutUser);


export default router;