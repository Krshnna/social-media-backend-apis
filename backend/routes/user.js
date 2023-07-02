const express = require("express");
const { register, login, follow, logout, updatePassword, updataProfile, deleteUser, getUserProfile, forgetPassword, resetPassword } = require("../controllers/user");
const { isAuthenticated } = require("../middlewares/auth");
const { getPostOfFollowing } = require("../controllers/post");
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/follow/:id").get(isAuthenticated, follow);
router.route("/posts").get(isAuthenticated, getPostOfFollowing);
router.route("/update/password").put(isAuthenticated, updatePassword);
router.route("/update/profile").put(isAuthenticated, updataProfile);
router.route("/delete/me").delete(isAuthenticated, deleteUser);
router.route("/user/:id").get(isAuthenticated, getUserProfile);
router.route("/forget/password").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
module.exports = router;