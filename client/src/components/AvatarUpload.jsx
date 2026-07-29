import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";

const AvatarUpload = ({ user, onUploaded }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setUploading(true);
    try {
      const res = await api.post("/upload/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
      onUploaded(res.data);
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-display text-2xl font-bold text-primary">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          user?.name?.charAt(0)?.toUpperCase()
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-base-dark shadow-glow"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

export default AvatarUpload;
