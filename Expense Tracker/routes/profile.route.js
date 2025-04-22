
const router=require("express").Router()
const profileController=require('../controllers/profile.controller')
const authCheck=require('../middleware/auth.middleware')
const profileUploader = require('../helper/profileUpload');

const profileUpload = new profileUploader({
    folderName: "uploads",
    supportedFiles: ["image/png", "image/jpg", "image/jpeg"],
    fieldSize:  1024 * 1024*5,  
});

router.post("/create",authCheck,profileUpload.upload().single("profilePic"),profileController.createProfile)

module.exports=router;