import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name username profilePicture headline")
      .populate("recipient", "name username profilePicture headline");

    // Get unique conversations
    const conversationMap = new Map();

    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === userId.toString()
          ? msg.recipient
          : msg.sender;

      if (!conversationMap.has(otherUser._id.toString())) {
        conversationMap.set(otherUser._id.toString(), {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      if (
        msg.recipient._id.toString() === userId.toString() &&
        !msg.read
      ) {
        const conv = conversationMap.get(otherUser._id.toString());
        if (conv) conv.unreadCount++;
      }
    });

    res.status(200).json(Array.from(conversationMap.values()));
  } catch (error) {
    console.error("Error in getConversations:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: userId },
        { sender: userId, recipient: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name profilePicture")
      .populate("recipient", "name profilePicture");

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, recipient: myId, read: false },
      { read: true }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    const myId = req.user._id;

    const message = new Message({
      sender: myId,
      recipient: userId,
      content,
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name profilePicture")
      .populate("recipient", "name profilePicture");

    // Emit via socket
    const io = req.app.get("io");
    io.to(userId.toString()).emit("newMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};