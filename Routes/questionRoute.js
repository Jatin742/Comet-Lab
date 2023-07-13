const express=require("express");
const { createQuestion, editQuestion, deleteQuestion, addTestCase, submitSolution, sendSubmissionResult } = require("../Controllers/questionController");
const { isAuthenticatedUser, authorizeRoles } = require("../Middlewares/auth");
const Router=express.Router();

Router.route("/admin/question").post(isAuthenticatedUser,authorizeRoles("admin"),createQuestion);

Router.route("/admin/question/:id").put(isAuthenticatedUser, authorizeRoles("admin"), editQuestion)
                                   .delete(isAuthenticatedUser, authorizeRoles("admin"),deleteQuestion);

Router.route("/admin/testcase/question/:id").put(isAuthenticatedUser, authorizeRoles("admin"),addTestCase);

Router.route("/question/:id/submit").post(isAuthenticatedUser, submitSolution, sendSubmissionResult);

module.exports=Router;