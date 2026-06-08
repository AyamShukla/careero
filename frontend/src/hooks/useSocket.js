import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (userId) => {
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io("http://localhost:5000", {
      query: { userId },
      withCredentials: true,
    });

    socketRef.current.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  return { socket: socketRef.current, onlineUsers };
};

export default useSocket;