const mongoose=require('mongoose')

const profileSchema=new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true, // prevents duplicate profiles
        required: true
      },
      fullname:{type:String,required:true},
      phone: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/, // exactly 10 digits
      },
      address:{type:String,required:true},
       profilePic:{type:String,required:true}

},{versionKey:false,timestamps:true})

const profileModel= mongoose.model("profile",profileSchema)

module.exports=profileModel;