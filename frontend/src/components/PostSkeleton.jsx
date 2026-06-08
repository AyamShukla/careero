const PostSkeleton = () => {
  return (
    <div className="bg-base-100 rounded-2xl shadow p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="skeleton h-3 w-32"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
      </div>
      <div className="skeleton h-3 w-full"></div>
      <div className="skeleton h-3 w-4/5"></div>
      <div className="skeleton h-40 w-full rounded-xl"></div>
      <div className="flex gap-4 mt-1">
        <div className="skeleton h-6 w-16"></div>
        <div className="skeleton h-6 w-20"></div>
      </div>
    </div>
  );
};

export default PostSkeleton;