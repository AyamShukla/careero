import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import ProfileSkeleton from "../components/ProfileSkeleton";
import {
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  Loader,
  UserPlus,
  UserCheck,
  Clock,
  X,
  Plus,
} from "lucide-react";

const ProfilePage = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await axiosInstance.get(`/users/${username}`);
      return res.data;
    },
  });

  const { data: connectionStatus } = useQuery({
    queryKey: ["connectionStatus", userProfile?._id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/connections/status/${userProfile._id}`);
      return res.data;
    },
    enabled: !!userProfile && userProfile._id !== authUser?._id,
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put("/users/profile", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const { mutate: sendRequest } = useMutation({
    mutationFn: async () =>
      axiosInstance.post(`/connections/request/${userProfile._id}`),
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", userProfile._id] });
    },
  });

  const { mutate: removeConnection } = useMutation({
    mutationFn: async () =>
      axiosInstance.delete(`/connections/${userProfile._id}`),
    onSuccess: () => {
      toast.success("Connection removed");
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", userProfile._id] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData((prev) => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateProfile(editData);
  };

  const isOwnProfile = authUser?._id === userProfile?._id;

  if (isLoading) return <ProfileSkeleton />;

  if (!userProfile) {
    return (
      <div className="text-center py-20">
        <p className="text-xl font-semibold">User not found</p>
      </div>
    );
  }

  const displayData = isEditing
    ? { ...userProfile, ...editData }
    : userProfile;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">

      {/* Profile Header Card */}
      <div className="bg-base-100 rounded-2xl shadow overflow-hidden">
        {/* Banner */}
        <div className="relative h-36 bg-primary/20">
          {displayData.bannerImg && (
            <img
              src={displayData.bannerImg}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer">
              <Camera size={24} className="text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e, "bannerImg")}
              />
            </label>
          )}
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4 w-fit">
            <img
              src={displayData.profilePicture || "/avatar.svg"}
              alt={displayData.name}
              className="w-24 h-24 rounded-full border-4 border-base-100 object-cover"
            />
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full cursor-pointer">
                <Camera size={18} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, "profilePicture")}
                />
              </label>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Full Name"
                className="input input-bordered w-full"
                value={editData.name ?? userProfile.name}
                onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Headline"
                className="input input-bordered w-full"
                value={editData.headline ?? userProfile.headline}
                onChange={(e) => setEditData((p) => ({ ...p, headline: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Location"
                className="input input-bordered w-full"
                value={editData.location ?? userProfile.location}
                onChange={(e) => setEditData((p) => ({ ...p, location: e.target.value }))}
              />
              <textarea
                placeholder="About"
                className="textarea textarea-bordered w-full"
                rows={3}
                value={editData.about ?? userProfile.about}
                onChange={(e) => setEditData((p) => ({ ...p, about: e.target.value }))}
              />
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">{displayData.name}</h1>
              <p className="text-base-content/70 mt-1">{displayData.headline}</p>
              {displayData.location && (
                <p className="flex items-center gap-1 text-sm text-base-content/50 mt-1">
                  <MapPin size={14} /> {displayData.location}
                </p>
              )}
              <p className="text-sm text-primary mt-1">
                {displayData.connections?.length} connections
              </p>
              {displayData.about && (
                <p className="text-sm text-base-content/70 mt-3">{displayData.about}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {isOwnProfile ? (
              isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="btn btn-primary btn-sm"
                  >
                    {isUpdating ? <Loader size={16} className="animate-spin" /> : "Save"}
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setEditData({}); }}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline btn-sm"
                >
                  Edit Profile
                </button>
              )
            ) : (
              <>
                {connectionStatus?.status === "not_connected" && (
                  <button onClick={() => sendRequest()} className="btn btn-primary btn-sm">
                    <UserPlus size={16} /> Connect
                  </button>
                )}
                {connectionStatus?.status === "pending" && (
                  <button disabled className="btn btn-disabled btn-sm">
                    <Clock size={16} /> Pending
                  </button>
                )}
                {connectionStatus?.status === "connected" && (
                  <button onClick={() => removeConnection()} className="btn btn-outline btn-sm">
                    <UserCheck size={16} /> Connected
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-base-100 rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {displayData.skills?.map((skill, i) => (
            <span key={i} className="badge badge-primary badge-outline px-3 py-2">
              {skill}
              {isEditing && (
                <button
                  onClick={() => {
                    const newSkills = [...(editData.skills ?? userProfile.skills)];
                    newSkills.splice(i, 1);
                    setEditData((p) => ({ ...p, skills: newSkills }));
                  }}
                  className="ml-1"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
          {isEditing && (
            <button
              onClick={() => {
                const skill = prompt("Enter skill:");
                if (skill) {
                  const newSkills = [...(editData.skills ?? userProfile.skills ?? []), skill];
                  setEditData((p) => ({ ...p, skills: newSkills }));
                }
              }}
              className="badge badge-outline px-3 py-2 cursor-pointer hover:badge-primary"
            >
              <Plus size={12} /> Add Skill
            </button>
          )}
        </div>
        {displayData.skills?.length === 0 && !isEditing && (
          <p className="text-sm text-base-content/50">No skills added yet</p>
        )}
      </div>

      {/* Experience */}
      <div className="bg-base-100 rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Briefcase size={18} /> Experience
        </h2>
        {displayData.experience?.length > 0 ? (
          <div className="flex flex-col gap-4">
            {displayData.experience.map((exp, i) => (
              <div key={i} className="flex flex-col border-l-2 border-primary/30 pl-4">
                <p className="font-semibold">{exp.title}</p>
                <p className="text-sm text-base-content/70">{exp.company}</p>
                <p className="text-xs text-base-content/50">
                  {exp.startDate?.slice(0, 10)} —{" "}
                  {exp.endDate ? exp.endDate.slice(0, 10) : "Present"}
                </p>
                {exp.description && (
                  <p className="text-sm mt-1 text-base-content/70">{exp.description}</p>
                )}
                {isEditing && (
                  <button
                    onClick={() => {
                      const newExp = [...(editData.experience ?? userProfile.experience)];
                      newExp.splice(i, 1);
                      setEditData((p) => ({ ...p, experience: newExp }));
                    }}
                    className="btn btn-ghost btn-xs text-error w-fit mt-1"
                  >
                    <X size={12} /> Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/50">No experience added yet</p>
        )}
        {isEditing && (
          <button
            onClick={() => {
              const newExp = {
                title: "Job Title",
                company: "Company Name",
                startDate: new Date().toISOString().slice(0, 10),
                endDate: "",
                description: "",
              };
              const newExps = [...(editData.experience ?? userProfile.experience ?? []), newExp];
              setEditData((p) => ({ ...p, experience: newExps }));
            }}
            className="btn btn-outline btn-sm mt-3"
          >
            <Plus size={14} /> Add Experience
          </button>
        )}
      </div>

      {/* Education */}
      <div className="bg-base-100 rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <GraduationCap size={18} /> Education
        </h2>
        {displayData.education?.length > 0 ? (
          <div className="flex flex-col gap-4">
            {displayData.education.map((edu, i) => (
              <div key={i} className="flex flex-col border-l-2 border-primary/30 pl-4">
                <p className="font-semibold">{edu.school}</p>
                <p className="text-sm text-base-content/70">{edu.fieldOfStudy}</p>
                <p className="text-xs text-base-content/50">
                  {edu.startYear} — {edu.endYear || "Present"}
                </p>
                {isEditing && (
                  <button
                    onClick={() => {
                      const newEdu = [...(editData.education ?? userProfile.education)];
                      newEdu.splice(i, 1);
                      setEditData((p) => ({ ...p, education: newEdu }));
                    }}
                    className="btn btn-ghost btn-xs text-error w-fit mt-1"
                  >
                    <X size={12} /> Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/50">No education added yet</p>
        )}
        {isEditing && (
          <button
            onClick={() => {
              const newEdu = {
                school: "School Name",
                fieldOfStudy: "Field of Study",
                startYear: 2020,
                endYear: 2024,
              };
              const newEdus = [...(editData.education ?? userProfile.education ?? []), newEdu];
              setEditData((p) => ({ ...p, education: newEdus }));
            }}
            className="btn btn-outline btn-sm mt-3"
          >
            <Plus size={14} /> Add Education
          </button>
        )}
      </div>

    </div>
  );
};

export default ProfilePage;