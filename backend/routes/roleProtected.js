const express=require('express');
const authMiddleware=require('../middleware/authMiddleware');
const roleMiddleware=require('../middleware/roleMiddleware');
const router=express.Router();
router.get('/jobseeker',authMiddleware,roleMiddleware('jobseeker'),(req,res)=>{
    res.json({message:'welcome JOB Seeker',user:req.user});
});
router.get('/employer',authMiddleware,roleMiddleware('employer'),(req,res)=>{
    res.json({message:'Welcome Employer',user:req.user});
});
router.get('/admin',authMiddleware,roleMiddleware('admin'),(req,res)=>{
    res.json({message:'Welcome Admin',user:req.user});
});
module.exports=router;