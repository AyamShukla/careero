import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import axiosInstance from "../lib/axios";
import Sidebar from "../components/layout/Sidebar";
import PostCreation from "../components/PostCreation";
import Post from "../components/Post";
import RecommendedUser from "../components/RecommendedUser";
import PostSkeleton from "../components/PostSkeleton";
import { Users, Loader } from "lucide-react";

const HomePage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const loadMoreRef = useRef(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get(`/posts?page=${pageParam}&limit=5`);
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });

  const { data: recommendedUsers } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/suggestions");
      return res.data;
    },
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <Sidebar user={authUser} />
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <PostCreation user={authUser} />

          {isLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : allPosts.length > 0 ? (
            <>
              {allPosts.map((post) => (
                <Post key={post._id} post={post} />
              ))}

              {/* Load more trigger */}
              <div ref={loadMoreRef} className="py-2 flex justify-center">
                {isFetchingNextPage && (
                  <Loader size={24} className="animate-spin text-primary" />
                )}
                {!hasNextPage && allPosts.length > 0 && (
                  <p className="text-sm text-base-content/40">
                    You're all caught up! 🎉
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-base-100 rounded-2xl shadow p-8 text-center">
              <div className="flex justify-center mb-4">
                <Users size={48} className="text-base-content/30" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
              <p className="text-base-content/60">
                Connect with people or create a post to get started!
              </p>
            </div>
          )}
        </div>

        {/* Right - Recommended Users */}
        <div className="lg:col-span-1">
          {recommendedUsers?.length > 0 && (
            <div className="bg-base-100 rounded-2xl shadow p-4">
              <h2 className="font-semibold text-lg mb-4">People you may know</h2>
              <div className="flex flex-col gap-4">
                {recommendedUsers.map((user) => (
                  <RecommendedUser key={user._id} user={user} />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HomePage;