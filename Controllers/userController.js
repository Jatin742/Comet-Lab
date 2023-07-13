const User=require("../Models/userModel");
const catchAsyncErrors=require("../Middlewares/catchAsyncErrors");
const sendToken=require("../utils/jwtToken");
const ErrorHander = require("../utils/errorhander");

exports.registerUser=catchAsyncErrors(async (req,res,next)=>{
    const newUser=await User.create(req.body);
    sendToken(newUser, 201, res);
})

exports.loginUser=catchAsyncErrors(async (req,res,next)=>{
    const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
  
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  });
