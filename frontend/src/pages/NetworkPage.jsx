import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Link } from "react-router-dom";
import { Check, X, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import NetworkSkeleton from "../components/NetworkSkeleton";

const NetworkPage = () => {
  const queryClient = useQueryClient();

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => {
      const res = await axiosInstance.get("/connections/requests");
      return res.data;
    },
  });

  const { data: connections, isLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await axiosInstance.get("/connections");
      return res.data;
    },
  });

  const { mutate: acceptRequest } = useMutation({
    mutationFn: async (requestId) =>
      axiosInstance.put(`/connections/accept/${requestId}`),
    onSuccess: () => {
      toast.success("Connection accepted!");
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  const { mutate: rejectRequest } = useMutation({
    mutationFn: async (requestId) =>
      axiosInstance.put(`/connections/reject/${requestId}`),
    onSuccess: () => {
      toast.success("Request rejected");
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
    },
  });

  const { mutate: removeConnection } = useMutation({
    mutationFn: async (userId) =>
      axiosInstance.delete(`/connections/${userId}`),
    onSuccess: () => {
      toast.success("Connection removed");
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  if (isLoading) return <NetworkSkeleton />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">

      {/* Pending Requests */}
      {connectionRequests?.length > 0 && (
        <div className="bg-base-100 rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Pending Requests ({connectionRequests.length})
          </h2>
          <div className="flex flex-col gap-4">
            {connectionRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between">
                <Link
                  to={`/profile/${request.sender.username}`}
                  className="flex items-center gap-3"
                >
                  <img
                    src={request.sender.profilePicture || "/avatar.svg"}
                    alt={request.sender.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold hover:underline">{request.sender.name}</p>
                    <p className="text-sm text-base-content/60">{request.sender.headline}</p>
                    <p className="text-xs text-base-content/40">
                      {request.sender.connections?.length} connections
                    </p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(request._id)}
                    className="btn btn-primary btn-sm"
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button
                    onClick={() => rejectRequest(request._id)}
                    className="btn btn-outline btn-sm"
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Connections */}
      <div className="bg-base-100 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          My Connections ({connections?.length || 0})
        </h2>

        {connections?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((connection) => (
              <div
                key={connection._id}
                className="flex items-center justify-between border border-base-200 rounded-xl p-3"
              >
                <Link
                  to={`/profile/${connection.username}`}
                  className="flex items-center gap-3"
                >
                  <img
                    src={connection.profilePicture || "/avatar.svg"}
                    alt={connection.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold hover:underline">{connection.name}</p>
                    <p className="text-sm text-base-content/60 line-clamp-1">
                      {connection.headline}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => removeConnection(connection._id)}
                  className="btn btn-outline btn-error btn-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <UserPlus size={48} className="mx-auto text-base-content/30 mb-3" />
            <p className="text-base-content/60">No connections yet</p>
            <p className="text-sm text-base-content/40 mt-1">
              Go to Home and connect with people!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;