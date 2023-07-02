const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a name"]
    },

    avatar: {
        public_id: String,
        url: String
    },
    email: {
        type: String,
        required: [true, "Please enter an email."],
        unique: [true, "Email already exists! Please use another one."],
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});


userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});


userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateToken = async function () {
    return jwt.sign({ __id: this._id }, process.env.JWT_SECRET)
}

userSchema.methods.getResetPassword = function () {
    const token = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return token;
};

module.exports = mongoose.model("User", userSchema);