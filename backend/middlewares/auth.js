const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send({ message: "Login Required" })
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.__id);
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}