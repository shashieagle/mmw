import { useState, useEffect, useRef } from "react";
import {
  useListVideos,
  useListCategories,
  useListStudioImages,
  useListImageCategories,
  useCreateStudioImage,
  useDeleteStudioImage,
  useRequestUploadUrl,
} from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VideoCard } from "@/components/VideoCard";
import { useAdminMode } from "@/hooks/use-admin-mode";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, ZoomIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Tab = "video" | "images";

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
        onClick={onClose}
      >
        <X size={28} />
      </button>
      <img
        src={src}
        alt=""
        className="max-w-full max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function AdminImageUpload({ onUploaded }: { onUploaded: () => void }) {
  const { toast } = useToast();
  const requestUrl = useRequestUploadUrl();
  const createImage = useCreateStudioImage();
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !category.trim()) {
      toast({ title: "Error", description: "Please enter a category first.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUrl.mutateAsync({
        data: { name: file.name, size: file.size, contentType: file.type || "image/jpeg" },
      });
      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "image/jpeg" },
      });
      await createImage.mutateAsync({
        data: { imagePath: objectPath, category: category.trim(), caption: caption.trim() || null },
      });
      toast({ title: "Image uploaded" });
      setOpen(false);
      setCategory("");
      setCaption("");
      onUploaded();
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white/70 hover:text-white hover:border-white/50 transition-all"
      >
        <Plus size={14} /> Add Image
      </button>
    );
  }

  return (
    <div className="border border-white/20 bg-white/5 p-4 flex flex-col gap-3 w-full max-w-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Upload Image</span>
        <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white"><X size={14} /></button>
      </div>
      <input
        type="text"
        placeholder="Category (e.g. Fashion, Product)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="bg-black border border-white/20 text-white text-sm px-3 py-2 w-full outline-none focus:border-white/50"
      />
      <input
        type="text"
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="bg-black border border-white/20 text-white text-sm px-3 py-2 w-full outline-none focus:border-white/50"
      />
      <label className={`cursor-pointer border border-dashed border-white/30 px-4 py-3 text-xs text-center text-gray-400 hover:border-white/60 hover:text-white transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
        {uploading ? "Uploading…" : "Click to choose image"}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
}

export default function Studio() {
  const [tab, setTab] = useState<Tab>("video");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { isAdmin } = useAdminMode();
  const { toast } = useToast();

  const { data: videoCategories } = useListCategories();
  const { data: videos, isLoading: isLoadingVideos } = useListVideos({ category: selectedCategory });

  const { data: imageCategories } = useListImageCategories();
  const { data: images, isLoading: isLoadingImages, refetch: refetchImages } = useListStudioImages({ category: selectedCategory });

  const deleteImage = useDeleteStudioImage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset category filter when switching tabs
  const handleTabSwitch = (t: Tab) => {
    setTab(t);
    setSelectedCategory(undefined);
  };

  const categories = tab === "video" ? videoCategories : imageCategories;

  const getImageUrl = (path: string) =>
    path.startsWith("/objects/") ? `/api/storage${path}` : path;

  const handleDeleteImage = async (id: number) => {
    try {
      await deleteImage.mutateAsync({ id });
      refetchImages();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-24">
      <Navbar />

      {lightbox && <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />}

      <main className="flex-1 container mx-auto px-6 md:px-12 py-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold mb-4">Creative Division</p>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white mb-6 uppercase font-display">
            The Studio
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg md:text-xl font-light">
            AI films, real estate transformations, food photography, fashion catalogues — everything
            we make lives here.
          </p>
        </motion.div>

        {/* Video / Images toggle */}
        <div className="flex items-center gap-8 mb-10">
          {(["video", "images"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabSwitch(t)}
              className={`text-sm uppercase tracking-widest font-bold transition-all duration-300 pb-2 border-b-2 ${
                tab === t ? "text-white border-white" : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {t === "video" ? "Video" : "Images"}
            </button>
          ))}
        </div>

        {/* Category filters + admin upload button */}
        <div className="flex flex-wrap items-center gap-6 mb-16 border-b border-white/10 pb-8">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`text-sm uppercase tracking-widest font-bold transition-all duration-300 pb-1 border-b-2 ${
              selectedCategory === undefined
                ? "text-white border-white"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            All Work
          </button>
          {categories?.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-sm uppercase tracking-widest font-bold transition-all duration-300 pb-1 border-b-2 ${
                selectedCategory === category
                  ? "text-white border-white"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {category}
            </button>
          ))}

          {isAdmin && tab === "images" && (
            <div className="ml-auto">
              <AdminImageUpload onUploaded={refetchImages} />
            </div>
          )}
        </div>

        {/* VIDEO GRID */}
        <AnimatePresence mode="wait">
          {tab === "video" && (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isLoadingVideos ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-video bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : videos && videos.length > 0 ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 md:gap-10">
                  {videos.map((video, idx) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="break-inside-avoid mb-6 md:mb-10"
                    >
                      <VideoCard video={video} index={idx} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center border border-white/5 bg-white/5">
                  <h3 className="text-2xl text-white mb-4 tracking-tight">Nothing here yet</h3>
                  <p className="text-gray-500 uppercase tracking-widest text-sm">Upload your first film to get started</p>
                </div>
              )}
            </motion.div>
          )}

          {/* IMAGE GRID */}
          {tab === "images" && (
            <motion.div
              key="images"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isLoadingImages ? (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="mb-4 bg-white/5 animate-pulse" style={{ height: `${180 + (i % 3) * 60}px` }} />
                  ))}
                </div>
              ) : images && images.length > 0 ? (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                  {images.map((image, idx) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="relative group mb-4 break-inside-avoid overflow-hidden bg-zinc-900"
                    >
                      <img
                        src={getImageUrl(image.imagePath)}
                        alt={image.caption || image.category}
                        className="w-full block object-cover group-hover:opacity-80 transition-opacity duration-300"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => setLightbox(getImageUrl(image.imagePath))}
                          className="w-9 h-9 bg-white flex items-center justify-center text-black hover:bg-gray-200 transition-colors"
                        >
                          <ZoomIn size={16} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="w-9 h-9 bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      {/* Caption */}
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-xs text-white/80">{image.caption}</p>
                        </div>
                      )}
                      {/* Category badge */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[10px] uppercase tracking-widest bg-black/70 text-white/70 px-2 py-1">
                          {image.category}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center border border-white/5 bg-white/5">
                  <h3 className="text-2xl text-white mb-4 tracking-tight">No images yet</h3>
                  <p className="text-gray-500 uppercase tracking-widest text-sm">
                    {isAdmin ? "Use the Add Image button above to upload your first AI image" : "Check back soon"}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
