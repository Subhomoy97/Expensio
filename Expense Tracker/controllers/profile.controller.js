const profileModel = require("../models/profile.model");
const deleteFile=require('../helper/deleteFile')
const userModel = require("../models/user.model");

    class ProfileController {
    async createProfile(req, res) {
        try {
        const userId = req.user?.userId; // from auth middleware

        const profilePic = req.file?.filename;

        const { address, phone ,fullname} = req.body;
        const user = await userModel.findOne({ _id: userId });
        console.log(user,"333")
        if (!user) {
            if(profilePic) deleteFile("uploads",profilePic)
            return res.status(404).json({ message: "User not found" });
          }
        let showFullName = `${user.firstName} ${user.lastName}`;

        if (!userId) {
            if(profilePic) deleteFile("uploads",profilePic)
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!profilePic) {
            if(profilePic) deleteFile("uploads",profilePic)
            return res.status(400).json({ message: "Profile picture is required" });
        }

        // Check if profile already exists
        const existing = await profileModel.findOne({ userId });
        if (existing) {
            if(profilePic) deleteFile("uploads",profilePic)
            return res
            .status(400)
            .json({ message: "Profile already exists for this user" });
        }

        const profile = await profileModel.create({
            userId,
            profilePic,
            fullname:showFullName,
            address,
            phone,
        });

        return res
            .status(201)
            .json({ message: "Profile created successfully", profile });
        } catch (err) {
        console.error("CreateProfile Error:", err.message);
        return res.status(500).json({ message: "Server error" });
        }
    }
}

module.exports = new ProfileController();
