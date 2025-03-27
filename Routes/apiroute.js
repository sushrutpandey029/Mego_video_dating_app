import express from 'express'

import {userregister, userlogin, updateuserprofile,getalluser,
       updatelocation, getuserprofile,sendmesg,chatlist,messagehistory,createReport,
       addFavorite,getFavorites,removeFavorite,addInterest,getInterests,
       removeInterest,getInterestsOnMe,rejectInterestOnMe,acceptInterestOnMe,myConnections,removeConnection} from '../Controllers/Api_Controller.js'

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

router.get('/getalluser/:id', getalluser);

router.post('/sendmesg', sendmesg);

router.get('/chatlist/:sender_id/:receiver_id', chatlist);

router.get('/messagehistory/:sender_id/:receiver_id', messagehistory);

router.post('/report', createReport);

router.post('/favorite', addFavorite);

router.get('/favorites/:id', getFavorites);

router.delete('/removefavorite', removeFavorite);

router.post('/interest', addInterest);

router.get('/interests/:id', getInterests);

router.delete('/removeinterest', removeInterest);

router.get('/interestOnMe/:id', getInterestsOnMe);

router.delete('/rejectinterestOnMe', rejectInterestOnMe );

router.post('/acceptinterestOnMe', acceptInterestOnMe);
router.get('/myconnections/:id',myConnections);
router.delete('/removeconnection',removeConnection);

router.post("/generate-token", generateAgoraToken);

// router.put("/generate-f_uuid/:id", updatefirebaseuuid);



export default router;