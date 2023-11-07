const express = require("express");
const router = express.Router();
const {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
} = require("../../controllers/User/UserController");

const { protect } = require("../../middleware/authMiddleware");
const uploadCloud = require("../../middleware/uploadMiddleware");

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router
    .route("/profile")
    .get(protect, getUserProfile)
    .put(protect, uploadCloud.single("image"), updateUserProfile);

module.exports = router;
