const {promisify} =require('util');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
 
//JWT TOKEN CREATION
const signToken = id =>{
    return jwt.sign({id: id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })
};

//SIGNUP AND TOKEN INITIALIZATION
exports.signup = async (req,res)=>{
    try{
        const newUser = await User.create(req.body);
        const token = signToken(newUser._id)

        res.status(201).json({
            status: 'success',
            token: token,
            data: {
                user: newUser
            }
        });
    }
    catch(err){
        res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
};

//LOGIN AND TOKEN REGENERATION
exports.login = async (req,res)=>{
    try{
        const {email ,password} = req.body;
        const user = await User.findOne({email}).select('+password');
        
        if(!user || !(await user.validPassword(password,user.password))){
            return res.status(400).json({
                status: 'fail',
                message: 'Either email or password is incorrect'
            });
        }
        const token = signToken(user._id);
        res.status(200).json({
            status: 'success',
            token: token,
            message: 'Logged in successfully'
        });
    } 
    catch(err){
        res.status(400).json({
            status: 'fail',
            message: 'Permission denied'
        });
    }
};

exports.protect = async (req, res, next)=>{
    //1) getting token and check if it's there
    let token;
    if(req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token) {
        return res.status(404).json({
            status: 'error',
            message: 'please login first'
        }); //401 please login token nahi h
    }

    //2) Verify the token
    let decoded;
    try{
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    }
    catch(err){
        return res.status(404).json({
            status: 'error',
            message: 'token not valid'
        }); //401 signature changed or time expired token Invalid
    }

    //3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return res.status(404).json({
            status: 'error',
            message: 'user not found'
        }); //401 User ded
    }

    //4) Check if user changed password after the token was issued
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return res.status(404).json({
            status: 'error',
            message: 'password changed login again after the token was issued'
        }); //401 password changed login again
    }

    next();
}

//user protect middleware before any route