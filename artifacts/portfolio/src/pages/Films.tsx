import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
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
import { ProjectFormCta, useProjectFormUrl } from "@/components/ProjectFormCta";

type Tab = "video" | "images";
type FilmDestination = "irl" | "ai";
const IRL_FILM_SECTIONS = [
  "Architecture",
  "Corporate",
  "Music Videos",
  "Short Film",
  "Documentaries",
] as const;
const IRL_IMAGE_SECTIONS = [
  "Architecture",
  "Portraits",
  "Product Shoots",
] as const;

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

function AdminImageUpload({
  onUploaded,
  productionType,
}: {
  onUploaded: () => void;
  productionType: FilmDestination;
}) {
  const { toast } = useToast();
  const requestUrl = useRequestUploadUrl();
  const createImage = useCreateStudioImage();
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (!category.trim()) {
      toast({ title: "Error", description: "Please enter a category first.", variant: "destructive" });
      return;
    }
    setUploading(true);
    let succeeded = 0;
    let failed = 0;
    for (const file of files) {
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
          data: {
            imagePath: objectPath,
            productionType,
            category: category.trim(),
            caption: caption.trim() || null,
          },
        });
        succeeded++;
      } catch {
        failed++;
      }
    }
    if (succeeded > 0) {
      toast({ title: `${succeeded} image${succeeded > 1 ? "s" : ""} uploaded` });
      onUploaded();
    }
    if (failed > 0) {
      toast({ title: `${failed} upload${failed > 1 ? "s" : ""} failed`, variant: "destructive" });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (succeeded > 0 && failed === 0) {
      setOpen(false);
      setCategory("");
      setCaption("");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white/70 hover:text-white hover:border-white/50 transition-all bg-white/5"
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
       {productionType === "irl" ? (
         <select
           value={category}
           onChange={(e) => setCategory(e.target.value)}
           className="bg-black border border-white/20 text-white text-sm px-3 py-2 w-full outline-none focus:border-white/50"
         >
           <option value="">Select IRL image section</option>
           {IRL_IMAGE_SECTIONS.map((section) => (
             <option key={section} value={section}>{section}</option>
           ))}
         </select>
       ) : (
         <input
           type="text"
           placeholder="Category (e.g. Fashion, Product)"
           value={category}
           onChange={(e) => setCategory(e.target.value)}
           className="bg-black border border-white/20 text-white text-sm px-3 py-2 w-full outline-none focus:border-white/50"
         />
       )}
      <input
        type="text"
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="bg-black border border-white/20 text-white text-sm px-3 py-2 w-full outline-none focus:border-white/50"
      />
      <label className={`cursor-pointer border border-dashed border-white/30 px-4 py-3 text-xs text-center text-gray-400 hover:border-white/60 hover:text-white transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
        {uploading ? "Uploading…" : "Click to choose images (select multiple)"}
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
}

export default function Studio() {
  const [tab, setTab] = useState<Tab>("video");
  const [filmDestination, setFilmDestination] = useState<FilmDestination>("ai");
  const [imageDestination, setImageDestination] = useState<FilmDestination>("ai");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { isAdmin } = useAdminMode();
  const { toast } = useToast();
  const projectFormUrl = useProjectFormUrl();

  const { data: videoCategories } = useListCategories();
  const { data: rawVideos, isLoading: isLoadingVideos } = useListVideos({
    category: selectedCategory,
    productionType: filmDestination,
  });
  const videos = rawVideos ? [...rawVideos].reverse() : rawVideos;

  const { data: imageCategories } = useListImageCategories();
  const { data: images, isLoading: isLoadingImages, refetch: refetchImages } = useListStudioImages({
    category: tab === "images" && imageDestination === "ai" ? selectedCategory : undefined,
    productionType: imageDestination,
  });
  const irlImageSections = IRL_IMAGE_SECTIONS.map((category) => ({
        category,
        images: images?.filter((image) => image.category === category) ?? [],
      }));

  const deleteImage = useDeleteStudioImage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset category filter when switching tabs
  const handleTabSwitch = (t: Tab) => {
    setTab(t);
    setSelectedCategory(undefined);
  };

  const categories =
    tab === "video"
      ? filmDestination === "irl"
        ? IRL_FILM_SECTIONS
        : videoCategories
      : imageCategories;

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

  const renderImageTile = (
    image: NonNullable<typeof images>[number],
    idx: number,
  ) => (
    <motion.div
      key={image.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: idx * 0.05 }}
      className="relative group mb-4 break-inside-avoid overflow-hidden bg-zinc-900 border border-white/5"
    >
      <img
        src={getImageUrl(image.imagePath)}
        alt={image.caption || image.category}
        className="w-full block object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
        <button
          onClick={() => setLightbox(getImageUrl(image.imagePath))}
          className="w-10 h-10 bg-white flex items-center justify-center text-black hover:bg-gray-200 transition-colors rounded-full shadow-xl"
          aria-label="View image"
        >
          <ZoomIn size={16} />
        </button>
        {isAdmin && (
          <button
            onClick={() => handleDeleteImage(image.id)}
            className="w-10 h-10 bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors rounded-full shadow-xl"
            aria-label="Delete image"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {image.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 px-4 py-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-xs text-white/90 drop-shadow-md">{image.caption}</p>
        </div>
      )}
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[10px] uppercase tracking-[0.2em] bg-black/80 backdrop-blur-sm text-white/80 px-2 py-1 border border-white/10 font-bold">
          {image.category}
        </span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col pt-32">
      <Navbar />
      {lightbox && <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />}
      
      <main className="flex-1 container mx-auto px-6 md:px-12 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 max-w-4xl"
        >
          <p className="text-xs uppercase tracking-[0.5em] font-bold mb-6 text-primary" data-testid="text-studio-hero-label">Creative Division</p>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8 uppercase font-display leading-[0.9]" data-testid="text-studio-hero-heading">
            The Studio
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed mb-10" data-testid="text-studio-hero-subheading">
            Visual work built for emotional communication. Where strategic narrative meets real-world execution and AI-assisted generation.
          </p>
          <div data-testid="container-studio-cta">
            <ProjectFormCta formUrl={projectFormUrl} />
          </div>
        </motion.div>

        {/* Films / Images toggle */}
        <div className="flex items-center gap-10 mb-12 border-b border-white/10" data-testid="container-media-tabs">
          {(["video", "images"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabSwitch(t)}
              data-testid={`tab-${t}`}
              className={`text-sm md:text-base uppercase tracking-widest font-bold transition-all duration-300 pb-3 border-b-2 relative top-[1px] ${
                tab === t ? "text-primary border-primary" : "text-gray-500 border-transparent hover:text-white"
              }`}
            >
              {t === "video" ? "Films" : "Imagery"}
            </button>
          ))}
        </div>

        {/* Real-shot / AI film destinations */}
        {tab === "video" && (
          <div className="grid grid-cols-2 gap-4 md:gap-6 mb-12 max-w-3xl" data-testid="container-destinations-video">
            {([
              {
                value: "irl",
                label: "IRL",
                description: "Real-world production",
              },
              {
                value: "ai",
                label: "AI Films",
                description: "AI-generated worlds",
              },
            ] as const).map((destination) => (
              <button
                key={destination.value}
                type="button"
                onClick={() => {
                  setFilmDestination(destination.value);
                  setSelectedCategory(undefined);
                }}
                aria-pressed={filmDestination === destination.value}
                data-testid={`btn-dest-video-${destination.value}`}
                className={`group relative overflow-hidden border p-6 md:p-8 text-left transition-all duration-300 ${
                  filmDestination === destination.value
                    ? "border-primary bg-primary/5 text-white"
                    : "border-white/10 bg-zinc-950 text-gray-400 hover:border-white/30 hover:bg-zinc-900"
                }`}
              >
                {filmDestination === destination.value && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                )}
                <span className={`block text-xl md:text-3xl uppercase tracking-tight font-display font-bold ${filmDestination === destination.value ? "text-white" : ""}`}>
                  {destination.label}
                </span>
                <span
                  className={`mt-3 block text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold ${
                    filmDestination === destination.value ? "text-primary" : "text-gray-500 group-hover:text-gray-400"
                  }`}
                >
                  {destination.description}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Real-shot / AI image destinations */}
        {tab === "images" && (
          <div className="grid grid-cols-2 gap-4 md:gap-6 mb-12 max-w-3xl" data-testid="container-destinations-images">
            {([
              {
                value: "irl",
                label: "IRL Images",
                description: "Real-world photography",
              },
              {
                value: "ai",
                label: "AI Images",
                description: "AI-generated imagery",
              },
            ] as const).map((destination) => (
              <button
                key={destination.value}
                type="button"
                onClick={() => {
                  setImageDestination(destination.value);
                  setSelectedCategory(undefined);
                }}
                aria-pressed={imageDestination === destination.value}
                data-testid={`btn-dest-images-${destination.value}`}
                className={`group relative overflow-hidden border p-6 md:p-8 text-left transition-all duration-300 ${
                  imageDestination === destination.value
                    ? "border-primary bg-primary/5 text-white"
                    : "border-white/10 bg-zinc-950 text-gray-400 hover:border-white/30 hover:bg-zinc-900"
                }`}
              >
                {imageDestination === destination.value && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                )}
                <span className={`block text-xl md:text-3xl uppercase tracking-tight font-display font-bold ${imageDestination === destination.value ? "text-white" : ""}`}>
                  {destination.label}
                </span>
                <span
                  className={`mt-3 block text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold ${
                    imageDestination === destination.value ? "text-primary" : "text-gray-500 group-hover:text-gray-400"
                  }`}
                >
                  {destination.description}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Archive filters + admin upload */}
        {((tab === "video") ||
          (tab === "images" && (imageDestination === "ai" || isAdmin))) && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mb-10 md:mb-16">
            {((tab === "video") ||
              (tab === "images" && imageDestination === "ai")) && (
              <>
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  data-testid="filter-all"
                  className={`shrink-0 text-[10px] md:text-xs uppercase tracking-widest font-bold transition-all duration-300 px-4 py-2 border rounded-full ${
                    selectedCategory === undefined
                      ? "text-black bg-white border-white"
                      : "text-gray-400 border-white/20 hover:border-white/50 hover:text-white"
                  }`}
                >
                  {tab === "video" ? "All Work" : "All Images"}
                </button>
                {categories?.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    data-testid={`filter-${category.toLowerCase()}`}
                    className={`shrink-0 text-[10px] md:text-xs uppercase tracking-widest font-bold transition-all duration-300 px-4 py-2 border rounded-full ${
                      selectedCategory === category
                        ? "text-black bg-white border-white"
                        : "text-gray-400 border-white/20 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </>
            )}

            {isAdmin && tab === "images" && (
              <div className="ml-auto">
                <AdminImageUpload onUploaded={refetchImages} productionType={imageDestination} />
              </div>
            )}
            {isAdmin && tab === "video" && (
              <Link
                href="/upload"
                className="ml-auto flex items-center gap-2 border border-white/20 bg-white/5 px-5 py-2.5 text-xs uppercase tracking-widest text-white/80 hover:border-white/50 hover:bg-white/10 hover:text-white transition-all"
              >
                <Plus size={14} /> {filmDestination === "irl" ? "Add IRL Film" : "Add Film"}
              </Link>
            )}
          </div>
        )}

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
                <div
                  className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 [grid-auto-rows:280px] md:[grid-auto-rows:360px]"
                >
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/5 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : videos && videos.length > 0 ? (
                <div
                  className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 [grid-auto-flow:dense] [grid-auto-rows:280px] md:[grid-auto-rows:440px]"
                >
                  {videos.map((video, idx) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className={
                        video.orientation === "portrait"
                          ? "col-span-1"
                          : "col-span-1 md:col-span-2"
                      }
                      data-testid={`video-card-${video.id}`}
                    >
                      <VideoCard video={video} index={idx} gridMode />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center border border-dashed border-white/10 bg-zinc-950">
                  <h3 className="text-2xl text-white mb-4 tracking-tight font-display">Nothing here yet</h3>
                  <p className="text-gray-500 uppercase tracking-widest text-sm">
                    {filmDestination === "irl"
                      ? isAdmin
                        ? "Use Add IRL Film above to get started"
                        : "Real-shot films will appear here"
                      : "Upload your first AI film to get started"}
                  </p>
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
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="mb-4 md:mb-6 bg-white/5 border border-white/5 animate-pulse" style={{ height: `${180 + (i % 3) * 60}px` }} />
                  ))}
                </div>
              ) : imageDestination === "irl" ? (
                irlImageSections.length > 0 ? (
                  <div className="space-y-24">
                    {irlImageSections.map((section, sectionIndex) => (
                      <section key={section.category} aria-labelledby={`irl-image-section-${sectionIndex}`}>
                        <div className="flex items-end justify-between gap-6 mb-8 border-b border-white/10 pb-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-3">
                              IRL Images / {String(sectionIndex + 1).padStart(2, "0")}
                            </p>
                            <h2
                              id={`irl-image-section-${sectionIndex}`}
                              className="text-3xl md:text-5xl tracking-tighter text-white font-display font-bold"
                            >
                              {section.category}
                            </h2>
                          </div>
                          <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold border border-white/10 px-3 py-1">
                            {section.images.length} {section.images.length === 1 ? "image" : "images"}
                          </span>
                        </div>
                        {section.images.length > 0 ? (
                          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6">
                            {section.images.map(renderImageTile)}
                          </div>
                        ) : (
                          <p className="border border-dashed border-white/10 bg-zinc-950 px-6 py-12 text-center text-xs uppercase tracking-[0.25em] text-gray-600 font-bold">
                            Projects coming soon
                          </p>
                        )}
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="py-32 text-center border border-dashed border-white/10 bg-zinc-950">
                    <h3 className="text-2xl text-white mb-4 tracking-tight font-display">No IRL images yet</h3>
                    <p className="text-gray-500 uppercase tracking-widest text-sm">
                      {isAdmin ? "Use Add Image above to upload your first real-shot image" : "Real-shot images will appear here"}
                    </p>
                  </div>
                )
              ) : images && images.length > 0 ? (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6">
                  {images.map(renderImageTile)}
                </div>
              ) : (
                <div className="py-32 text-center border border-dashed border-white/10 bg-zinc-950">
                  <h3 className="text-2xl text-white mb-4 tracking-tight font-display">No images yet</h3>
                  <p className="text-gray-500 uppercase tracking-widest text-sm">
                    {isAdmin ? "Use Add Image above to upload your first AI image" : "Check back soon"}
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
