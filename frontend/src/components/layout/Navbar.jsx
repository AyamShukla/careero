import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { Bell, Home, LogOut, User, Users, Sun, Moon, Search, X, MessageCircle } from "lucide-react";
import useTheme from "../../hooks/useTheme";
import { useState, useRef, useEffect } from "react";

const Navbar = ({ authUser }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/notifications");
      return res.data;
    },
    enabled: !!authUser,
  });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => {
      const res = await axiosInstance.get("/connections/requests");
      return res.data;
    },
    enabled: !!authUser,
  });

  const { data: searchResults } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: async () => {
      const res = await axiosInstance.get(`/users/search?query=${searchQuery}`);
      return res.data;
    },
    enabled: searchQuery.length >= 2,
  });

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get("/messages/conversations");
      return res.data;
    },
    enabled: !!authUser,
  });

  const { mutate: logout } = useMutation({
    mutationFn: async () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/login");
      toast.success("Logged out successfully");
    },
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications?.filter((n) => !n.read)?.length;
  const pendingRequestsCount = connectionRequests?.length;
  const unreadMessages = conversations?.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <nav className="bg-base-100 shadow-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-4">

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <span className="text-2xl font-bold text-primary">Careero</span>
          </Link>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm" ref={searchRef}>
            <div className="flex items-center bg-base-200 rounded-xl px-3 py-2 gap-2">
              <Search size={16} className="text-base-content/50 shrink-0" />
              <input
                type="text"
                placeholder="Search people..."
                className="bg-transparent outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setShowResults(false); }}>
                  <X size={14} className="text-base-content/50" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchQuery.length >= 2 && (
              <div className="absolute top-full mt-2 w-full bg-base-100 rounded-xl shadow-lg border border-base-200 z-50 overflow-hidden">
                {searchResults?.length > 0 ? (
                  searchResults.map((user) => (
                    <Link
                      key={user._id}
                      to={`/profile/${user.username}`}
                      onClick={() => { setSearchQuery(""); setShowResults(false); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors"
                    >
                      <img
                        src={user.profilePicture || "/avatar.svg"}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-base-content/60">{user.headline}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-base-content/60">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-5 shrink-0">
            <Link to="/" className="flex flex-col items-center text-neutral hover:text-primary transition-colors">
              <Home size={22} />
              <span className="text-xs hidden md:block">Home</span>
            </Link>

            <Link to="/network" className="flex flex-col items-center text-neutral hover:text-primary transition-colors relative">
              <Users size={22} />
              <span className="text-xs hidden md:block">Network</span>
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </Link>

            <Link to="/chat" className="flex flex-col items-center text-neutral hover:text-primary transition-colors relative">
              <MessageCircle size={22} />
              <span className="text-xs hidden md:block">Chat</span>
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </Link>

            <Link to="/notifications" className="flex flex-col items-center text-neutral hover:text-primary transition-colors relative">
              <Bell size={22} />
              <span className="text-xs hidden md:block">Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              to={`/profile/${authUser?.username}`}
              className="flex flex-col items-center text-neutral hover:text-primary transition-colors"
            >
              <User size={22} />
              <span className="text-xs hidden md:block">Profile</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="flex flex-col items-center text-neutral hover:text-primary transition-colors"
            >
              {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
              <span className="text-xs hidden md:block">
                {theme === "light" ? "Dark" : "Light"}
              </span>
            </button>

            <button
              onClick={() => logout()}
              className="flex flex-col items-center text-neutral hover:text-red-500 transition-colors"
            >
              <LogOut size={22} />
              <span className="text-xs hidden md:block">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;