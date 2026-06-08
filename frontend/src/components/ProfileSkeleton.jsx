const ProfileSkeleton = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
      <div className="bg-base-100 rounded-2xl shadow overflow-hidden">
        <div className="skeleton h-36 w-full rounded-none"></div>
        <div className="px-6 pb-6">
          <div className="skeleton w-24 h-24 rounded-full -mt-12 mb-4"></div>
          <div className="flex flex-col gap-2">
            <div className="skeleton h-6 w-40"></div>
            <div className="skeleton h-4 w-56"></div>
            <div className="skeleton h-4 w-32"></div>
          </div>
          <div className="skeleton h-9 w-28 mt-4"></div>
        </div>
      </div>

      <div className="bg-base-100 rounded-2xl shadow p-6">
        <div className="skeleton h-5 w-20 mb-4"></div>
        <div className="flex gap-2 flex-wrap">
          <div className="skeleton h-7 w-16 rounded-full"></div>
          <div className="skeleton h-7 w-20 rounded-full"></div>
          <div className="skeleton h-7 w-14 rounded-full"></div>
        </div>
      </div>

      <div className="bg-base-100 rounded-2xl shadow p-6">
        <div className="skeleton h-5 w-28 mb-4"></div>
        <div className="flex flex-col gap-3">
          <div className="skeleton h-4 w-48"></div>
          <div className="skeleton h-4 w-36"></div>
          <div className="skeleton h-4 w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;