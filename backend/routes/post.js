const { createPost, likeunlike, getPost, PostComment, deleteComment } = require("../controllers/post");
const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

router.route("/post/upload").post(isAuthenticated, createPost);
router.route("/post/:id").get(isAuthenticated, likeunlike);
router.route("/post/:id").delete(isAuthenticated, getPost);
router.route("/post/comment/:id").post(isAuthenticated, PostComment)
// router.route("/post/comment/:id").delete(isAuthenticated, deleteComment)
module.exports = router;