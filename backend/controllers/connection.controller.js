import ConnectionRequest from "../models/connection.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { sendConnectionAcceptedEmail } from "../emails/connectionEmail.js";

export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === userId) {
      return res.status(400).json({ message: "You can't send a request to yourself" });
    }

    if (req.user.connections.includes(userId)) {
      return res.status(400).json({ message: "You are already connected" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      sender: senderId,
      recipient: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Connection request already sent" });
    }

    const newRequest = new ConnectionRequest({
      sender: senderId,
      recipient: userId,
    });

    await newRequest.save();
    res.status(201).json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("Error in sendConnectionRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await ConnectionRequest.findById(requestId)
      .populate("sender", "name email username")
      .populate("recipient", "name username");

    if (!request) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (request.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { connections: request.recipient._id },
    });
    await User.findByIdAndUpdate(request.recipient._id, {
      $addToSet: { connections: request.sender._id },
    });

    const notification = new Notification({
      recipient: request.sender._id,
      type: "connectionAccepted",
      relatedUser: request.recipient._id,
    });
    await notification.save();

    try {
      await sendConnectionAcceptedEmail(
        request.sender.email,
        request.sender.name,
        request.recipient.name
      );
    } catch (emailError) {
      console.error("Error sending connection email:", emailError.message);
    }

    res.status(200).json({ message: "Connection request accepted" });
  } catch (error) {
    console.error("Error in acceptConnectionRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to reject this request" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Connection request rejected" });
  } catch (error) {
    console.error("Error in rejectConnectionRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getConnectionRequests = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("sender", "name username profilePicture headline connections");

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getConnectionRequests:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "connections",
      "name username profilePicture headline connections"
    );

    res.status(200).json(user.connections);
  } catch (error) {
    console.error("Error in getUserConnections:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    await User.findByIdAndUpdate(myId, { $pull: { connections: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { connections: myId } });

    res.status(200).json({ message: "Connection removed successfully" });
  } catch (error) {
    console.error("Error in removeConnection:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);

    if (currentUser.connections.includes(userId)) {
      return res.status(200).json({ status: "connected" });
    }

    const pendingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        return res.status(200).json({ status: "pending" });
      } else {
        return res.status(200).json({ status: "received", requestId: pendingRequest._id });
      }
    }

    res.status(200).json({ status: "not_connected" });
  } catch (error) {
    console.error("Error in getConnectionStatus:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};