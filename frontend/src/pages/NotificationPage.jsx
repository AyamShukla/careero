import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Link } from "react-router-dom";
import { ThumbsUp, MessageSquare, UserPlus, Bell, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const NotificationPage = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/notifications");
      return res.data;
    },
  });

  const { mutate: markAsRead } = useMutation({
    mutationFn: async (id) =>
      axiosInstance.put(`/notifications/${id}/read`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const { mutate: deleteNotification } = useMutation({
    mutationFn: async (id) =>
      axiosInstance.delete(`/notifications/${id}`),
    onSuccess: () => {
      toast.success("Notification deleted");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const getIcon = (type) => {
    if (type === "like") return <ThumbsUp size={16} className="text-primary" />;
    if (type === "comment") return <MessageSquare size={16} className="text-green-500" />;
    if (type === "connectionAccepted") return <UserPlus size={16} className="text-blue-500" />;
  };

  const getMessage = (notification) => {
    if (notification.type === "like")
      return `${notification.relatedUser.name} liked your post`;
    if (notification.type === "comment")
      return `${notification.relatedUser.name} commented on your post`;
    if (notification.type === "connectionAccepted")
      return `${notification.relatedUser.name} accepted your connection request`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-base-100 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Notifications</h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : notifications?.length > 0 ? (
          <div className="flex flex-col gap-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex items-start justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                  !notification.read ? "bg-primary/5 border border-primary/20" : "bg-base-200"
                }`}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={notification.relatedUser.profilePicture || "/avatar.svg"}
                      alt={notification.relatedUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-base-100 rounded-full p-0.5">
                      {getIcon(notification.type)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm">{getMessage(notification)}</p>
                    {notification.relatedPost && (
                      <Link
                        to={`/post/${notification.relatedPost._id}`}
                        className="text-xs text-primary hover:underline mt-0.5 block"
                      >
                        View post
                      </Link>
                    )}
                    {!notification.read && (
                      <span className="text-xs text-primary font-medium">New</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  className="btn btn-ghost btn-xs text-error"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Bell size={48} className="mx-auto text-base-content/30 mb-3" />
            <p className="text-base-content/60">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;