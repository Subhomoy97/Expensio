const router = require("express").Router();
const profileController = require('../../module/profile/controller/profile.controller');
const authCheck = require('../../middleware/auth.middleware')();
const profileUploader = require('../../helper/profileUpload');
const validate = require('../../middleware/validate.request');
const { createProfileSchema, updateProfileSchema } = require('../../validations/profile.validator');

const profileUpload = new profileUploader({
    folderName: "uploads/profile",
    supportedFiles: ["image/png", "image/jpg", "image/jpeg"],
    fieldSize: 1024 * 1024 * 5,
});

// Create Profile Route
router.post(
  "/create",
  authCheck.authenticateAPI,
  profileUpload.upload().single("profilePic"),
  validate(createProfileSchema),  // 🔥 Validate create request
  profileController.createProfile
);

// Update Profile Route
router.post(
  "/update",
  authCheck.authenticateAPI,
  profileUpload.upload().single("profilePic"),
  validate(updateProfileSchema),  // 🔥 Validate update request
  profileController.updateProfile
);

module.exports = router;
