import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Link } from "react-router-dom";
import { ThumbsUp, MessageSquare, Trash2, Send, Loader } from "lucide-react";
import toast from "react-hot-toast";

const Post = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const isLiked = post.likes.includes(authUser?._id);
  const isOwner = post.author._id === authUser?._id;

  const { mutate: likePost } = useMutation({
    mutationFn: async () => axiosInstance.post(`/posts/${post._id}/like`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => axiosInstance.delete(`/posts/${post._id}`),
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: addComment, isPending: isCommenting } = useMutation({
    mutationFn: async () =>
      axiosInstance.post(`/posts/${post._id}/comment`, { content: comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setComment("");
      toast.success("Comment added!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const handleLike = () => {
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 500);
    likePost();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow p-4 flex flex-col gap-3">
      {/* Author Info */}
      <div className="flex items-start justify-between">
        <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3">
          <img
            src={post.author.profilePicture || "/avatar.svg"}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-sm hover:underline">{post.author.name}</p>
            <p className="text-xs text-base-content/60">{post.author.headline}</p>
            <p className="text-xs text-base-content/40">{formatDate(post.createdAt)}</p>
          </div>
        </Link>

        {isOwner && (
          <button
            onClick={() => deletePost()}
            disabled={isDeleting}
            className="btn btn-ghost btn-xs text-error"
          >
            {isDeleting ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && <p className="text-sm">{post.content}</p>}

      {/* Image */}
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="w-full rounded-xl object-cover max-h-96"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-base-200">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm btn btn-ghost btn-xs transition-all duration-200 ${
            isLiked ? "text-primary" : "text-base-content/60"
          }`}
        >
          <ThumbsUp
            size={15}
            className={`transition-all duration-200 ${
              isLiked ? "fill-primary" : ""
            } ${isLikeAnimating ? "scale-150" : "scale-100"}`}
          />
          {post.likes.length > 0 && <span>{post.likes.length}</span>}
          Like
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-sm btn btn-ghost btn-xs text-base-content/60"
        >
          <MessageSquare size={15} />
          {post.comments.length > 0 && <span>{post.comments.length}</span>}
          Comment
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="flex flex-col gap-3">
          {post.comments.map((c, index) => (
            <div key={index} className="flex items-start gap-2">
              <img
                src={c.user.profilePicture || "/avatar.svg"}
                alt={c.user.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="bg-base-200 rounded-xl px-3 py-2 text-sm flex-1">
                <p className="font-medium text-xs">{c.user.name}</p>
                <p>{c.content}</p>
              </div>
            </div>
          ))}

          {/* Add Comment */}
          <div className="flex items-center gap-2">
            <img
              src={authUser?.profilePicture || "/avatar.svg"}
              alt={authUser?.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <input
              type="text"
              placeholder="Add a comment..."
              className="input input-bordered input-sm flex-1"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && comment.trim()) addComment();
              }}
            />
            <button
              onClick={() => addComment()}
              disabled={isCommenting || !comment.trim()}
              className="btn btn-primary btn-sm btn-circle"
            >
              {isCommenting ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;