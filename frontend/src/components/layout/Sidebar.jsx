import { Link } from "react-router-dom";
import { Home, UserPlus, Bell } from "lucide-react";

const Sidebar = ({ user }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Profile Card */}
      <div className="bg-base-100 rounded-2xl shadow overflow-hidden">
        {/* Banner */}
        <div
          className="h-16 w-full bg-primary/20"
          style={{
            backgroundImage: user?.bannerImg ? `url(${user.bannerImg})` : "",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Avatar */}
        <div className="flex flex-col items-center pb-4 -mt-8">
          <Link to={`/profile/${user?.username}`}>
            <img
              src={user?.profilePicture || "/avatar.svg"}
              alt={user?.name}
              className="w-16 h-16 rounded-full border-4 border-base-100 object-cover"
            />
          </Link>
          <Link
            to={`/profile/${user?.username}`}
            className="font-semibold mt-2 hover:underline"
          >
            {user?.name}
          </Link>
          <p className="text-xs text-base-content/60 text-center px-4 mt-1">
            {user?.headline}
          </p>
          <p className="text-xs text-base-content/50 mt-1">
            {user?.connections?.length} connections
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="bg-base-100 rounded-2xl shadow p-4 flex flex-col gap-2">
        <Link
          to="/"
          className="flex items-center gap-3 text-sm hover:bg-base-200 px-3 py-2 rounded-lg transition-colors"
        >
          <Home size={18} className="text-primary" />
          <span>Home</span>
        </Link>
        <Link
          to="/network"
          className="flex items-center gap-3 text-sm hover:bg-base-200 px-3 py-2 rounded-lg transition-colors"
        >
          <UserPlus size={18} className="text-primary" />
          <span>My Network</span>
        </Link>
        <Link
          to="/notifications"
          className="flex items-center gap-3 text-sm hover:bg-base-200 px-3 py-2 rounded-lg transition-colors"
        >
          <Bell size={18} className="text-primary" />
          <span>Notifications</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;