import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Link } from "react-router-dom";
import { UserPlus, Check } from "lucide-react";
import toast from "react-hot-toast";

const RecommendedUser = ({ user }) => {
  const queryClient = useQueryClient();

  const { data: connectionStatus } = useQuery({
    queryKey: ["connectionStatus", user._id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/connections/status/${user._id}`);
      return res.data;
    },
  });

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: async () => axiosInstance.post(`/connections/request/${user._id}`),
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", user._id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const isConnected = connectionStatus?.status === "connected";
  const isPendingRequest = connectionStatus?.status === "pending";

  return (
    <div className="flex items-center justify-between">
      <Link to={`/profile/${user.username}`} className="flex items-center gap-3">
        <img
          src={user.profilePicture || "/avatar.svg"}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-medium hover:underline">{user.name}</p>
          <p className="text-xs text-base-content/60 line-clamp-1">{user.headline}</p>
        </div>
      </Link>

      {!isConnected && !isPendingRequest && (
        <button
          onClick={() => sendRequest()}
          disabled={isPending}
          className="btn btn-primary btn-xs btn-outline"
        >
          <UserPlus size={14} />
          Connect
        </button>
      )}

      {isPendingRequest && (
        <button disabled className="btn btn-xs btn-disabled">
          Pending
        </button>
      )}

      {isConnected && (
        <button disabled className="btn btn-xs btn-success btn-outline">
          <Check size={14} />
          Connected
        </button>
      )}
    </div>
  );
};

export default RecommendedUser;