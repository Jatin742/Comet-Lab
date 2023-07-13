const express=require("express");
const { registerUser, loginUser, logoutUser } = require("../Controllers/userController");
const Router=express.Router();
const { isAuthenticatedUser } =require("../Middlewares/auth");

Router.route("/register").post(registerUser);
Router.route("/login").post(loginUser);
Router.route("/logout").post(isAuthenticatedUser ,logoutUser);

module.exports=Router;