const express=require('express');
const router=express.Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const User=require('../models/User');
router.post('/register',async(req,res)=>{
    try{
        const{name,email,password,role,companyName}=req.body;
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:'User already exists'});
        }
        const salt=await bcrypt.genSalt(10);
        const hashed=await bcrypt.hash(password,salt);
        const user=new User({
            name,email,password:hashed,role,companyName:role==='employer'?companyName:undefined
        });
        await user.save();
        res.status(201).json({
            message:'User registered successfully'
        });
    }catch(error){
        console.log(error);
        res.status(500).json({message:'Server error'});
    }
});

router.post('/login',async(req,res)=>{
    try{
        const{email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:'Invalid credentials'});
        }
        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:'Invalid credentails'});
        }
        const token=jwt.sign(
           { id:user._id,role:user.role},
            process.env.JWT_SECRET,
            {expiresIn:'1d'}
        );
res.json({
    token,user:{
        id:user._id,name:user.name,email:user.email,role:user.role
    }
});
    }catch(error){
        console.log("login error:",error);
        res.status(500).json({message:'Server error'});
    }
});
module.exports=router;