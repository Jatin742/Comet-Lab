const mongoose=require("mongoose");
const MONGO_URI=process.env.MONGO_URI;

const connectToMongo=()=>{
    mongoose.connect(MONGO_URI)
    .then(()=>{console.log("Connected To Mongo Successfully");})
    .catch((err)=>console.log(err));
}

module.exports=connectToMongo