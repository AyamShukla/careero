import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getSuggestedConnections = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("connections");

    const suggestedUsers = await User.find({
      _id: {
        $ne: req.user._id,
        $nin: currentUser.connections,
      },
    })
      .select("-password")
      .limit(3);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("Error in getSuggestedConnections:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getPublicProfile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "headline",
      "location",
      "about",
      "skills",
      "experience",
      "education",
      "profilePicture",
      "bannerImg",
    ];

    const updatedData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updatedData[field] = req.body[field];
      }
    }

    if (req.body.profilePicture) {
      const result = await cloudinary.uploader.upload(
        req.body.profilePicture
      );
      updatedData.profilePicture = result.secure_url;
    }

    if (req.body.bannerImg) {
      const result = await cloudinary.uploader.upload(
        req.body.bannerImg
      );
      updatedData.bannerImg = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// SEARCH USERS
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ message: "Search query is required" });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { headline: { $regex: query, $options: "i" } },
      ],
    })
      .select("-password")
      .limit(8);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};