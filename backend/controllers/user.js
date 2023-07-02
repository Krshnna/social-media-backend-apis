const { json } = require("body-parser");
const User = require("../models/User");
const Post = require("../models/Post");
const { sendEmail } = require("../middlewares/sendEmail");
const crypto = require("crypto");
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });

        if (user) {
            return res.status(422).send("Email already exists!");
        }

        user = await User.create({
            name,
            password,
            email,
            avatar: {
                public_id: "id",
                url: "url",
            },
        });

        res.status(201).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(403).json({ success: false, message: "Email doesnt't exist" });
        };

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(403).json({ success: false, message: "Invalid Password" });
        }

        const token = await user.generateToken();
        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }

        res.status(200).cookie("token", token, options).json({
            success: true,
            user,
            token
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
};

exports.logout = async (req, res) => {
    try {
        res.status(200).cookie("token", null, { expires: new Date(Date.now()), httpOnly: true }).json({
            success: true,
            message: "Logged Out Successfully"
        })
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
}



exports.follow = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(400).json({
                success: false,
                message: "User Not Found",
            })
        }

        if (loggedUser.following.includes(userToFollow._id)) {
            const idxFollowing = loggedUser.following.indexOf(userToFollow._id);
            const idxFollower = userToFollow.followers.indexOf(loggedUser._id);

            loggedUser.following.splice(idxFollowing, 1);
            userToFollow.followers.splice(idxFollower, 1);

            await loggedUser.save();
            await userToFollow.save();

            res.status(200).json({
                success: true,
                message: "User Unfollowed Successfully"
            })

        }
        else {
            loggedUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedUser._id);

            await loggedUser.save();
            await userToFollow.save();

            res.status(200).json({
                success: true,
                message: "User Followed Successfully"
            })

        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide old and new password",
            })
        }
        const isMatch = await user.matchPassword(oldPassword);
        console.log(isMatch);
        if (!isMatch) {
            return res.status(500).json({
                success: false,
                message: "Incorrect Old Password",
            })
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password Updated Successfully! Redirecting..."
        })


    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
};


exports.updataProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);
        const { name, email } = req.body;

        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }

        //user.avatar = todo;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile Updated Successfully !!"
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const felower = user.followers;
        const folwing = user.following;
        const userId = user._id;
        await user.deleteOne();

        for (let i = 0; i < felower.length; i++) {
            const elem = await User.findById(felower[i]);
            const idx = elem.following.indexOf(userId);
            elem.following.splice(idx, 1);
            await elem.save();
        }

        for (let i = 0; i < folwing.length; i++) {
            const elem = await User.findById(folwing[i]);
            const idx = elem.followers.indexOf(userId);
            elem.followers.splice(idx, 1);
            await elem.save();
        }

        for (let i = 0; i < posts.length; i++) {
            const post = await Post.findById(posts[i]);
            await post.deleteOne();
            await post.save();
        }

        //logout user immediately 
        res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });

        res.status(200).json({
            success: true,
            message: "User Account Deleted"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("posts");

        res.status(200).json({
            success: true
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("posts");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(200).json({
            success: true,
            user,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }

};


exports.forgetPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(500).json({
                success: false,
                message: "User Not Found",
            })
        }
        const reset = user.getResetPassword();
        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${reset}`;
        const message = `Reset your password by clicking on link below: \n\n ${resetUrl}`;
        await user.save();
        try {
            await sendEmail({
                email: user.email, subject: "Reset Password",
                message
            });
            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email}`,
            });
        }
        catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};


exports.resetPassword = async (req, res) => {
    try {
        // taking token from mail and converting back to token that is stored in database.
        const rpt = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: rpt,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid or has expired"
            })
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password Updated Successfully..!!!"
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}