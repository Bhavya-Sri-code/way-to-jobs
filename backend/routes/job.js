const express=require('express');
const authMiddleware=require('../middleware/authMiddleware');
const roleMiddleware=require('../middleware/roleMiddleware');
const Job=require('../models/Job');
const router=express.Router();
router.post('/create',authMiddleware,roleMiddleware('employer','admin'),
async(req,res)=>{
try{
    const{title,description,location,salary}=req.body;
    const job=new Job({
        title,description,location,salary,postedBy:req.user.id
    });
    await job.save();
    res.status(201).json({message:'Job posted successfully',job});
}catch(errpr){
    console.log(error);
    res.status(500).json({message:'Server error'});
}
});
router.get('/all',authMiddleware,async(req,res)=>{
    try{
        const jobs=await Job.find().populate('postedBy','name email role');
        res.json(jobs);
    }catch(error){
        console.log(error);
        res.status(500).json({message:'Server error'});
    }
});
module.exports=router;