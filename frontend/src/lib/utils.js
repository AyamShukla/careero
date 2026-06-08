export const getProfilePicture = (user) => {
  if (user?.profilePicture) return user.profilePicture;
  const name = user?.name || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128&bold=true`;
};