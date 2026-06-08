const NetworkSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
      <div className="bg-base-100 rounded-2xl shadow p-6">
        <div className="skeleton h-6 w-40 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between border border-base-200 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="skeleton w-12 h-12 rounded-full shrink-0"></div>
                <div className="flex flex-col gap-2">
                  <div className="skeleton h-3 w-28"></div>
                  <div className="skeleton h-3 w-20"></div>
                </div>
              </div>
              <div className="skeleton h-7 w-16 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkSkeleton;