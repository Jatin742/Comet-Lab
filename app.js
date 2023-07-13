const express = require("express");
const dotenv = require("dotenv");
const app = express();
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const errorMiddleware=require("./Middlewares/error");

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

const user=require("./Routes/userRoute");
const question=require("./Routes/questionRoute");

app.use("/api/v1",user);
app.use("/api/v1",question);

app.use(errorMiddleware);

module.exports=app;