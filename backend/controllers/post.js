const Post = require("../models/Post");
const User = require("../models/User");

exports.createPost = async (req, res) => {
    try {
        const newPostData = {
            caption: req.body.caption,
            image: {
                public_id: "req.body.public_id",
                url: "req.body.url"
            },
            author: req.user._id,
        } 
        
        const post = new Post(newPostData);
        const user = await User.findById(req.user._id);
        user.posts.push(post._id); 
        await user.save();
        await post.save();

        res.status(200).json({ 
            success:true,
            message: "Post Upload Successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({
                success: false,
                message: "Post Not Available"
            })
        }

        if(post.author.toString() !== req.user._id.toString()) {
            return res.status().json({
                success: false,
                message: "Unauthorised"
            })
        }
 
        const user = await User.findById(req.user._id);
        const index = user.posts.indexOf(req.params.id);
        console.log(user);
        console.log(index);
        user.posts.splice(index, 1);
        await post.deleteOne(); 
        await user.save();

        res.status(200).json({
            success: true,
            message: "Post Deleted"
        })


    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        })
    }
}


exports.likeunlike = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({
                success: false,
                message: "Page Not Found"
            })
        }
        if(post.like.includes(req.user._id)) {
            const index = post.like.indexOf(req.user._id);
            post.like.splice(index, 1);
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Post Unliked",
            })
        }
        else {
            post.like.push(req.user._id);
            await post.save();

            return res.status(200).json({
                success: true,
                message: "Post Liked" 
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getPostOfFollowing = async(req, res) => {
    try {
        
        // const user = await User.findById(req.user._id).populate("following", "posts"); // it is one way of getting 
        const user = await User.findById(req.user._id);
        const posts = await Post.find({
            author: {
                $in: user.following
            }
        })

        res.status(200).json({
            success: true,
            posts,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.PostComment = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({success:false, msg:"No Post found"});
        }

        let commentExist = -1;
        post.comments.forEach((elem, idx) => {
            if(elem.user.toString() === req.user._id.toString())
                commentExist = idx;
        })

        if(commentExist !== -1) {
            post.comments[commentExist].comment = req.body.comment;
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Comment added"
            })
        }
        else  {
            post.comments.push({
                user: req.user._id,
                comment: req.body.comment,
            })
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Comment added"
            })
        }
           

        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};