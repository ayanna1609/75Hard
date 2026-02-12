import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Camera, Plus, Trash2, X } from "lucide-react";

const ProgressPhotos = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) loadPhotos();
  }, [user]);

  const loadPhotos = async () => {
    const { data } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("user_id", user!.id)
      .order("photo_date", { ascending: true });
    setPhotos(data || []);
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("progress-photos")
      .upload(path, file);

    if (uploadError) {
      console.error(uploadError);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("progress-photos")
      .getPublicUrl(path);

    await supabase.from("progress_photos").insert({
      user_id: user.id,
      photo_url: urlData.publicUrl,
      day_number: photos.length + 1,
      photo_date: new Date().toISOString().split("T")[0],
    });

    await loadPhotos();
    setUploading(false);
  };

  const deletePhoto = async (id: string) => {
    await supabase.from("progress_photos").delete().eq("id", id);
    await loadPhotos();
    setSelectedPhoto(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl text-foreground tracking-wide">PROGRESS PHOTOS</h3>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-green text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {uploading ? "Uploading..." : "Add Photo"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadPhoto(file);
          }}
        />
      </div>

      {photos.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No progress photos yet</p>
          <p className="text-muted-foreground text-sm mt-1">Start documenting your transformation!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-border hover:border-primary/50 transition-all"
              onClick={() => setSelectedPhoto(photo.id)}
            >
              <img
                src={photo.photo_url}
                alt={`Day ${photo.day_number}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-1 left-2 text-xs font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                Day {photo.day_number}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (() => {
        const photo = photos.find((p) => p.id === selectedPhoto);
        if (!photo) return null;
        return (
          <div
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <img src={photo.photo_url} alt="" className="w-full rounded-xl" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="p-2 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 rounded-full bg-secondary text-foreground hover:bg-muted transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center mt-3 text-muted-foreground text-sm">
                Day {photo.day_number} • {new Date(photo.photo_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ProgressPhotos;
