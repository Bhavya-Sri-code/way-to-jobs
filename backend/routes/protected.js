const express=require('express');
const authMiddleware=require('../middleware/authMiddleware');
const router=express.Router();
router.get('/dashboard',authMiddleware,(req,res)=>{
    res.json({
        meassage:'welcome to protected dashbord',
        user:req.user
    });
});
module.exports=router;