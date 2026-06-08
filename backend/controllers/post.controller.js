import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id).select("connections");

    const posts = await Post.find({
      author: { $in: [...currentUser.connections, req.user._id] },
    })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({
      author: { $in: [...currentUser.connections, req.user._id] },
    });

    const hasMore = skip + posts.length < totalPosts;

    res.status(200).json({ posts, hasMore, totalPosts });
  } catch (error) {
    console.error("Error in getFeedPosts:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    let newPost;

    if (image) {
      const imgResult = await cloudinary.uploader.upload(image);
      newPost = new Post({
        author: req.user._id,
        content,
        image: imgResult.secure_url,
      });
    } else {
      newPost = new Post({
        author: req.user._id,
        content,
      });
    }

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    if (post.image) {
      const publicId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in deletePost:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture username headline");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in getPostById:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);

      if (post.author.toString() !== userId.toString()) {
        const notification = new Notification({
          recipient: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: post._id,
        });
        await notification.save();
      }
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Error in likePost:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const { content } = req.body;

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      content,
      user: req.user._id,
    };

    post.comments.push(comment);
    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: post.author,
        type: "comment",
        relatedUser: req.user._id,
        relatedPost: post._id,
      });
      await notification.save();
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in addComment:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};