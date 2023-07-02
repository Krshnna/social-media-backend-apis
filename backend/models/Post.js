const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: true
    },
    image: {
        publicId: String,
        url: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            comment: {
                type: String,
                required: true
            },
        },
    ],

});

module.exports = mongoose.model("Post", postSchema);