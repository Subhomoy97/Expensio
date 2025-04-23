const profileModel = require("../models/profile.model");
const deleteFile=require('../helper/deleteFile')
const userModel = require("../models/user.model");

    class ProfileController {
    async createProfile(req, res) {
        try {
        const userId = req.user?.userId; // from auth middleware

        const profilePic = req.file?.filename;

        const { address, phone } = req.body;
        const user = await userModel.findOne({ _id: userId });

        if (!user) {
            if(profilePic) deleteFile("uploads/profile_Pic",profilePic)
            return res.status(404).json({ message: "User not found" });
          }
        let showFullName = `${user.firstName} ${user.lastName}`;

        if (!userId) {
            if(profilePic) deleteFile("uploads/profile_Pic",profilePic)
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!profilePic) {
            if(profilePic) deleteFile("uploads/profile_Pic",profilePic)
            return res.status(400).json({ message: "Profile picture is required" });
        }

        // Check if profile already exists
        const existing = await profileModel.findOne({ userId });
        if (existing) {
            if(profilePic) deleteFile("uploads/profile_Pic",profilePic)
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

    async updateProfile(req, res) {
        try {
          const userId = req.user?.userId;
          if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
          const user = await userModel.findById(userId);
          if (!user) return res.status(404).json({ message: "User not found" });
    
          const existingProfile = await profileModel.findOne({ userId });
          if (!existingProfile)
            return res.status(404).json({ message: "Profile not found" });
    
          // Handle new profile picture if uploaded
          let profilePic = existingProfile.profilePic;
          if (req.file?.filename) {
            if (profilePic) deleteFile("uploads/profile_Pic", profilePic);
            profilePic = req.file.filename;
          }
         
          // Update user name if provided
          const { firstName, lastName, address, phone } = req.body;
          
    
          let newFullName = existingProfile.fullname;

          if (phone && (!/^\d{10}$/.test(phone))) {
            if (profilePic) deleteFile("uploads/profile_Pic", profilePic);
            return res.status(400).json({ message: "Phone must be exactly 10 digits" });
          }
          if (firstName || lastName) {
            const updatedFirstName = firstName || user.firstName;
            const updatedLastName = lastName || user.lastName;
            newFullName = `${updatedFirstName} ${updatedLastName}`;
    
            await userModel.findByIdAndUpdate(userId, {
              firstName: updatedFirstName,
              lastName: updatedLastName,
            });
          }
    
          const updatedProfile = await profileModel.findOneAndUpdate(
            { userId },
            {
              profilePic,
              address,
              phone,
              fullname: newFullName,
            },
            { new: true }
          );
    
          return res
            .status(200)
            .json({ message: "Profile updated successfully", profile: updatedProfile });
        } catch (err) {
          console.error("UpdateProfile Error:", err.message);
          return res.status(500).json({ message: "Server error" });
        }
      }
}

module.exports = new ProfileController();
