import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { Image, Loader } from "lucide-react";

const PostCreation = ({ user }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const queryClient = useQueryClient();

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async (postData) => {
      const res = await axiosInstance.post("/posts/create", postData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Post created!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setContent("");
      setImage(null);
      setImagePreview(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    createPost({ content, image });
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow p-4">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={user?.profilePicture || "/avatar.svg"}
          alt={user?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <textarea
          placeholder="What's on your mind?"
          className="textarea textarea-bordered w-full resize-none text-sm"
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {imagePreview && (
        <div className="mb-3 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full rounded-xl max-h-60 object-cover"
          />
          <button
            onClick={() => {
              setImage(null);
              setImagePreview(null);
            }}
            className="absolute top-2 right-2 btn btn-circle btn-xs btn-error"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary cursor-pointer transition-colors">
          <Image size={18} />
          <span>Photo</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={isPending || (!content.trim() && !image)}
          className="btn btn-primary btn-sm"
        >
          {isPending ? (
            <>
              <Loader size={16} className="animate-spin" /> Posting...
            </>
          ) : (
            "Post"
          )}
        </button>
      </div>
    </div>
  );
};

export default PostCreation;