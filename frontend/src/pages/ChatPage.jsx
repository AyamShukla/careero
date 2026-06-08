import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import useSocket from "../hooks/useSocket";
import { Send, Loader, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { socket, onlineUsers } = useSocket(authUser?._id);

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get("/messages/conversations");
      return res.data;
    },
  });

  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await axiosInstance.get("/connections");
      return res.data;
    },
  });

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRoom", authUser?._id);

    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
      refetchConversations();
      scrollToBottom();
    });

    return () => socket.off("newMessage");
  }, [socket, authUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (user) => {
    setSelectedUser(user);
    setIsLoadingMessages(true);
    try {
      const res = await axiosInstance.get(`/messages/${user._id}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    setIsSending(true);
    try {
      const res = await axiosInstance.post(`/messages/${selectedUser._id}`, {
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      refetchConversations();
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const isOnline = (userId) => onlineUsers.includes(userId?.toString());

  const chatUsers = connections || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-base-100 rounded-2xl shadow overflow-hidden flex h-[75vh]">

        {/* Left — Contacts */}
        <div className="w-72 border-r border-base-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-base-200">
            <h2 className="font-semibold text-lg">Messages</h2>
          </div>

          <div className="overflow-y-auto flex-1">
            {chatUsers.length > 0 ? (
              chatUsers.map((user) => {
                const conversation = conversations?.find(
                  (c) => c.user._id === user._id
                );
                return (
                  <button
                    key={user._id}
                    onClick={() => loadMessages(user)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors text-left ${
                      selectedUser?._id === user._id ? "bg-base-200" : ""
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={user.profilePicture || "/avatar.svg"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {isOnline(user._id) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-base-100"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      {conversation?.lastMessage && (
                        <p className="text-xs text-base-content/50 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {conversation?.unreadCount > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <MessageSquare size={32} className="text-base-content/30 mb-2" />
                <p className="text-sm text-base-content/50">No connections yet</p>
                <Link to="/network" className="text-xs text-primary mt-1 hover:underline">
                  Find people to connect
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right — Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-base-200 flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedUser.profilePicture || "/avatar.svg"}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {isOnline(selectedUser._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-base-100"></span>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-xs text-base-content/50">
                    {isOnline(selectedUser._id) ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-10">
                    <Loader size={24} className="animate-spin text-primary" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMine =
                      msg.sender._id === authUser?._id ||
                      msg.sender._id?.toString() === authUser?._id?.toString();
                    return (
                      <div
                        key={msg._id}
                        className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}
                      >
                        <img
                          src={msg.sender.profilePicture || "/avatar.svg"}
                          alt={msg.sender.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                            isMine
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-base-200 rounded-bl-none"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare size={32} className="text-base-content/30 mb-2" />
                    <p className="text-sm text-base-content/50">
                      No messages yet. Say hi! 👋
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-base-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="input input-bordered flex-1 input-sm"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newMessage.trim()) handleSend();
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !newMessage.trim()}
                  className="btn btn-primary btn-sm btn-circle"
                >
                  {isSending ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={48} className="text-base-content/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your Messages</h3>
              <p className="text-base-content/50 text-sm">
                Select a connection to start chatting
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatPage;