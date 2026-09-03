import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Upload, Trash2, X, Plus, Pencil, Check, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicFormUrl } from "@/components/ProjectFormCta";
import { ObjectUploader } from "@workspace/object-storage-web";
import { useRequestUploadUrl } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminMode } from "@/hooks/use-admin-mode";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const GRADIENTS = [
  { label: "Default Dark", value: "from-zinc-900/40 via-zinc-950 to-black" },
  { label: "Warm Amber", value: "from-amber-950/40 via-zinc-950 to-black" },
  { label: "Stone", value: "from-stone-900/40 via-zinc-950 to-black" },
  { label: "Ember (Brand)", value: "from-orange-950/40 via-zinc-950 to-black" },
  { label: "Purple", value: "from-purple-950/40 via-zinc-950 to-black" },
  { label: "Blue", value: "from-blue-950/40 via-zinc-950 to-black" },
  { label: "Emerald", value: "from-emerald-950/40 via-zinc-950 to-black" },
  { label: "Rose", value: "from-rose-950/40 via-zinc-950 to-black" },
];

interface CaseStudy {
  id: number;
  slug: string;
  tag: string;
  client: string;
  headline: string;
  result: string;
  detail: string;
  gradient: string;
  stats: { value: string; label: string }[];
  sortOrder: number;
  createdAt: string;
}

interface FormState {
  client: string;
  tag: string;
  headline: string;
  result: string;
  detail: string;
  gradient: string;
  stat1v: string; stat1l: string;
  stat2v: string; stat2l: string;
  stat3v: string; stat3l: string;
}

const EMPTY_FORM: FormState = {
  client: "", tag: "", headline: "", result: "", detail: "",
  gradient: GRADIENTS[0].value,
  stat1v: "", stat1l: "", stat2v: "", stat2l: "", stat3v: "", stat3l: "",
};

function formToPayload(f: FormState, existingSlug?: string) {
  const slug = existingSlug ?? f.client.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const stats = [
    f.stat1v && { value: f.stat1v, label: f.stat1l },
    f.stat2v && { value: f.stat2v, label: f.stat2l },
    f.stat3v && { value: f.stat3v, label: f.stat3l },
  ].filter(Boolean) as { value: string; label: string }[];
  return { slug, tag: f.tag, client: f.client, headline: f.headline, result: f.result, detail: f.detail, gradient: f.gradient, stats };
}

function studyToForm(s: CaseStudy): FormState {
  const st = s.stats;
  return {
    client: s.client, tag: s.tag, headline: s.headline, result: s.result, detail: s.detail, gradient: s.gradient,
    stat1v: st[0]?.value ?? "", stat1l: st[0]?.label ?? "",
    stat2v: st[1]?.value ?? "", stat2l: st[1]?.label ?? "",
    stat3v: st[2]?.value ?? "", stat3l: st[2]?.label ?? "",
  };
}

function CaseStudyFormModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: FormState;
  onSave: (f: FormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [f, setF] = useState<FormState>(initial);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const inputCls = "w-full bg-zinc-900 border border-white/10 text-white text-sm px-4 py-3 placeholder-gray-600 focus:outline-none focus:border-white/30";
  const labelCls = "block text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-1.5";

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <p className="text-xs uppercase tracking-[0.4em] font-bold text-white">
            {initial.client ? "Edit Case Study" : "Add Case Study"}
          </p>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Client Name</label>
              <input className={inputCls} placeholder="e.g. Genesis Photo Albums" value={f.client} onChange={set("client")} />
            </div>
            <div>
              <label className={labelCls}>Tag / Industry</label>
              <input className={inputCls} placeholder="e.g. Photography & Packaging" value={f.tag} onChange={set("tag")} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Headline</label>
            <input className={inputCls} placeholder="e.g. Premium Product Shoots with AI Styling" value={f.headline} onChange={set("headline")} />
          </div>

          <div>
            <label className={labelCls}>Result (short — shown in sidebar)</label>
            <textarea className={`${inputCls} resize-none`} rows={2} placeholder="e.g. Delivered a full product catalogue without a studio." value={f.result} onChange={set("result")} />
          </div>

          <div>
            <label className={labelCls}>Detail (full paragraph)</label>
            <textarea className={`${inputCls} resize-none`} rows={5} placeholder="Tell the full story of the engagement…" value={f.detail} onChange={set("detail")} />
          </div>

          <div>
            <label className={labelCls}>Accent Color</label>
            <select className={inputCls} value={f.gradient} onChange={set("gradient")}>
              {GRADIENTS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Stats (up to 3)</label>
            <div className="space-y-2">
              {([1, 2, 3] as const).map((n) => (
                <div key={n} className="grid grid-cols-2 gap-2">
                  <input
                    className={inputCls}
                    placeholder={`Stat ${n} value (e.g. 80%)`}
                    value={f[`stat${n}v` as keyof FormState]}
                    onChange={set(`stat${n}v` as keyof FormState)}
                  />
                  <input
                    className={inputCls}
                    placeholder={`Stat ${n} label (e.g. Cost reduction)`}
                    value={f[`stat${n}l` as keyof FormState]}
                    onChange={set(`stat${n}l` as keyof FormState)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-white transition-colors border border-white/10 hover:border-white/30">
            Cancel
          </button>
          <button
            onClick={() => onSave(f)}
            disabled={saving || !f.client || !f.tag || !f.headline || !f.result || !f.detail}
            className="px-8 py-3 text-xs uppercase tracking-widest font-bold bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface MediaItem {
  id: number;
  caseStudySlug: string;
  mediaPath: string;
  mediaType: string;
  caption: string | null;
  createdAt: string;
}

function getMediaDisplayUrl(path: string) {
  if (!path) return "";
  return path.startsWith("/objects/") ? `/api/storage${path}` : path;
}

function CaseStudyGallery({ slug, isAdmin }: { slug: string; isAdmin: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const requestUrl = useRequestUploadUrl();
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);

  const { data: media = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["case-study-media", slug],
    queryFn: async () => {
      const res = await fetch(`/api/case-studies/${slug}/media`);
      if (!res.ok) throw new Error("Failed to load media");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/case-studies/${slug}/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-study-media", slug] }),
    onError: () => toast({ title: "Error", description: "Failed to delete media.", variant: "destructive" }),
  });

  const pendingMediaPath = useRef<string | null>(null);

  const handleGetUploadParams = async (file: any) => {
    const { uploadURL, objectPath } = await requestUrl.mutateAsync({
      data: { name: file.name, size: file.size, contentType: file.type || "application/octet-stream" },
    });
    pendingMediaPath.current = objectPath;
    return { method: "PUT" as const, url: uploadURL, headers: { "Content-Type": file.type || "application/octet-stream" } };
  };

  const handleUploadComplete = async () => {
    const objectPath = pendingMediaPath.current;
    if (!objectPath) return;
    setIsUploading(true);
    try {
      const isVideo = objectPath.match(/\.(mp4|mov|webm|avi|mkv)$/i);
      const res = await fetch(`/api/case-studies/${slug}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaPath: objectPath, mediaType: isVideo ? "video" : "image" }),
      });
      if (!res.ok) throw new Error("Save failed");
      pendingMediaPath.current = null;
      qc.invalidateQueries({ queryKey: ["case-study-media", slug] });
      setShowUpload(false);
      toast({ title: "Added", description: "Media added to gallery." });
    } catch {
      toast({ title: "Error", description: "Upload failed to save.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isLoading && media.length === 0 && !isAdmin) return null;

  return (
    <div className="mt-12 border-t border-white/10 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold">
          Visual Evidence {media.length > 0 && <span className="text-gray-700 ml-2">({media.length})</span>}
        </h4>
        {isAdmin && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-4 py-2"
          >
            {showUpload ? <><X size={11} /> Cancel</> : <><Plus size={11} /> Add Media</>}
          </button>
        )}
      </div>

      {isAdmin && showUpload && (
        <div className="mb-6 border border-white/10 bg-black/50 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-bold">Upload Photo or Video</p>
          <div className="uppy-dark-theme min-h-[120px]">
            <ObjectUploader onGetUploadParameters={handleGetUploadParams} onComplete={handleUploadComplete}>
              {isUploading ? "Saving..." : "Select File"}
            </ObjectUploader>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-white/5 animate-pulse" />)}
        </div>
      ) : media.length === 0 ? (
        <div className="border border-dashed border-white/10 py-12 text-center">
          <Upload className="mx-auto mb-3 text-gray-700" size={20} />
          <p className="text-gray-700 text-xs uppercase tracking-widest">No media yet — use Add Media above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative group aspect-square overflow-hidden bg-zinc-900 cursor-pointer border border-white/5"
              onClick={() => !isAdmin && setLightbox(item)}
              data-testid={`gallery-item-${item.id}`}
            >
              {item.mediaType === "video" ? (
                <video
                  src={getMediaDisplayUrl(item.mediaPath)}
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                  muted playsInline
                  onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                  onMouseOut={(e) => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
                />
              ) : (
                <img src={getMediaDisplayUrl(item.mediaPath)} alt={item.caption || "Gallery"} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center gap-2">
                {isAdmin ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                    disabled={deleteMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 bg-black/80 p-2 border border-red-500/20"
                  >
                    <Trash2 size={15} />
                  </button>
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center rounded-full">
                    <span className="text-white text-xs"><ZoomIn size={14} /></span>
                  </div>
                )}
              </div>
              {item.mediaType === "video" && (
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] uppercase tracking-widest px-2 py-1 font-bold">Video</div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"><X size={28} /></button>
          <div className="max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            {lightbox.mediaType === "video" ? (
              <video src={getMediaDisplayUrl(lightbox.mediaPath)} className="w-full max-h-[85vh] object-contain" controls autoPlay />
            ) : (
              <img src={getMediaDisplayUrl(lightbox.mediaPath)} alt="" className="w-full max-h-[85vh] object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Architects() {
  const { isAdmin } = useAdminMode();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: submissions = [] } = useQuery<{ id: number; name: string; email: string; inquiry: string; message: string; createdAt: string }[]>({
    queryKey: ["contact-submissions"],
    queryFn: async () => { const r = await fetch("/api/contact/submissions"); if (!r.ok) throw new Error(); return r.json(); },
    enabled: isAdmin,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingStudy, setEditingStudy] = useState<CaseStudy | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CaseStudy | null>(null);

  const [architectsFormUrl, setArchitectsFormUrl] = useState("");
  const [editingForm, setEditingForm] = useState(false);
  const [draftForm, setDraftForm] = useState("");
  const [savingForm, setSavingForm] = useState(false);
  const publicFormUrl = getPublicFormUrl(architectsFormUrl);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        setArchitectsFormUrl(data["architects_form"] ?? "");
      })
      .catch(() => {});
  }, []);

  const saveFormUrl = async () => {
    setSavingForm(true);
    try {
      await fetch("/api/settings/architects_form", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: draftForm }),
      });
      setArchitectsFormUrl(draftForm);
      setEditingForm(false);
    } finally {
      setSavingForm(false);
    }
  };

  const { data: caseStudies = [], isLoading: loadingStudies } = useQuery<CaseStudy[]>({
    queryKey: ["case-studies"],
    queryFn: async () => {
      const res = await fetch("/api/case-studies");
      if (!res.ok) throw new Error("Failed to load case studies");
      return res.json();
    },
  });

  const createStudy = useMutation({
    mutationFn: async (payload: object) => {
      const res = await fetch("/api/case-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-studies"] });
      setShowForm(false);
      toast({ title: "Case study added" });
    },
    onError: () => toast({ title: "Error", description: "Failed to save case study.", variant: "destructive" }),
  });

  const updateStudy = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: object }) => {
      const res = await fetch(`/api/case-studies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-studies"] });
      setEditingStudy(null);
      toast({ title: "Case study updated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update case study.", variant: "destructive" }),
  });

  const deleteStudy = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/case-studies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-studies"] });
      setConfirmDelete(null);
      toast({ title: "Case study deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }),
  });

  const handleSaveNew = (f: FormState) => createStudy.mutate(formToPayload(f));
  const handleSaveEdit = (f: FormState) => {
    if (!editingStudy) return;
    updateStudy.mutate({ id: editingStudy.id, payload: formToPayload(f, editingStudy.slug) });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <Navbar />

      {/* Form modals */}
      {showForm && (
        <CaseStudyFormModal
          initial={EMPTY_FORM}
          onSave={handleSaveNew}
          onClose={() => setShowForm(false)}
          saving={createStudy.isPending}
        />
      )}
      {editingStudy && (
        <CaseStudyFormModal
          initial={studyToForm(editingStudy)}
          onSave={handleSaveEdit}
          onClose={() => setEditingStudy(null)}
          saving={updateStudy.isPending}
        />
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 p-8 max-w-sm w-full text-center shadow-2xl">
            <p className="text-white font-bold mb-2">Delete this case study?</p>
            <p className="text-gray-500 text-sm mb-6">"{confirmDelete.client}" will be permanently removed.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(null)} className="px-6 py-3 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-white border border-white/10 hover:border-white/30 transition-colors">Cancel</button>
              <button
                onClick={() => deleteStudy.mutate(confirmDelete.id)}
                disabled={deleteStudy.isPending}
                className="px-6 py-3 text-xs uppercase tracking-widest font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40"
              >
                {deleteStudy.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-end pb-24 overflow-hidden pt-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950 to-black opacity-80" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}>
            <p className="text-xs uppercase tracking-[0.5em] font-bold mb-6 text-primary" data-testid="text-arch-hero-label">Monkmonkeyworks — Architecture</p>
            <h1 className="text-6xl md:text-[8rem] lg:text-[10rem] font-bold tracking-tighter leading-[0.85] mb-8 font-display" data-testid="text-arch-hero-heading">
              Business
              <br />
              <span className="text-gray-600">Architects</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-xl leading-relaxed mb-12" data-testid="text-arch-hero-subheading">
              We diagnose, blueprint, and build the systems that allow creative and commercial businesses to scale.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 border-t border-white/5 bg-zinc-950">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="border-l-2 border-primary/50 pl-8"
          >
            <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-300 italic mb-6">
              "A great deal of strategy work is trying to figure out what is going on. Not just deciding what to do, but more fundamentally, deciding what the challenge is."
            </p>
            <footer className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-500">Richard Rumelt</footer>
          </motion.blockquote>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="py-24 md:py-32 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] font-bold mb-4 text-primary" data-testid="text-cases-label">Proof of Work</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display" data-testid="text-cases-heading">Case Studies</h2>
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <p className="text-gray-500 max-w-sm text-sm leading-relaxed font-light">Real projects. Real results. No vanity metrics — just measurable business impact.</p>
              {isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  className="shrink-0 flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-white border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 px-5 py-3 transition-colors"
                  data-testid="button-add-case"
                >
                  <Plus size={12} /> Add Case Study
                </button>
              )}
            </div>
          </div>

          {loadingStudies ? (
            <div className="space-y-12">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-96 bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : caseStudies.length === 0 ? (
            <div className="py-32 text-center border border-dashed border-white/10">
              <p className="text-gray-600 text-sm uppercase tracking-widest mb-4">No case studies yet</p>
              {isAdmin && (
                <button onClick={() => setShowForm(true)} className="text-xs uppercase tracking-widest font-bold text-white border border-white/20 px-6 py-3 hover:border-white/40 transition-colors">
                  Add Your First Case Study
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {caseStudies.map((study, i) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.05 }}
                  className={`relative overflow-hidden bg-zinc-950 border border-white/5 hover:border-white/15 transition-all duration-500 group`}
                  data-testid={`case-study-card-${study.id}`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/80 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      <button
                        onClick={() => setEditingStudy(study)}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white bg-black/80 border border-white/10 hover:border-white/30 px-3 py-1.5 transition-all"
                      >
                        <Pencil size={10} /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(study)}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-400 bg-black/80 border border-red-500/20 hover:border-red-400/40 px-3 py-1.5 transition-all"
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    </div>
                  )}

                  <div className="p-8 md:p-14">
                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-10 mb-12">
                      <div className="flex-1">
                        <span className="inline-block text-[10px] uppercase tracking-[0.4em] font-bold text-primary border border-primary/20 bg-primary/5 px-3 py-1 mb-5">{study.tag}</span>
                        <p className="text-gray-500 text-sm uppercase tracking-widest font-bold mb-3">{study.client}</p>
                        <h3 className="text-3xl md:text-5xl font-bold tracking-tighter text-white leading-tight font-display">{study.headline}</h3>
                      </div>
                      {study.stats.length > 0 && (
                        <div className="flex flex-wrap gap-8 xl:gap-12 shrink-0">
                          {study.stats.map((s, si) => (
                            <div key={si} className="text-left">
                              <p className="text-3xl md:text-4xl font-bold text-white font-mono mb-2">{s.value}</p>
                              <p className="text-[10px] uppercase tracking-widest text-gray-500 max-w-[120px] leading-snug">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      <div className="lg:col-span-4 border-l-2 border-white/10 pl-6">
                        <p className="text-gray-300 text-base font-mono leading-relaxed">{study.result}</p>
                      </div>
                      <div className="lg:col-span-8 lg:border-l border-white/5 lg:pl-10">
                        <p className="text-gray-400 text-lg leading-relaxed font-light">{study.detail}</p>
                      </div>
                    </div>

                    <CaseStudyGallery slug={study.slug} isAdmin={isAdmin} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section className="py-24 md:py-40 bg-zinc-950 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.4em] font-bold mb-4 text-primary" data-testid="text-process-label">Methodology</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display mb-6" data-testid="text-process-heading">Our Process</h2>
            <p className="text-gray-400 text-lg font-light leading-relaxed">A systematic approach to diagnosing friction and building scalable architecture.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {[
              { num: "01", title: "Discovery", desc: "We audit your current operations, understand your market, and identify where technology creates the most leverage." },
              { num: "02", title: "Blueprint", desc: "We design a precise implementation plan — tools, timelines, costs, and expected ROI. No ambiguity." },
              { num: "03", title: "Build", desc: "We build and integrate. Working solutions fast, full deployment with your team trained and ready." },
              { num: "04", title: "Scale", desc: "We stay on to optimize, iterate, and expand as your capability grows and new opportunities emerge." },
            ].map((step, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-black p-8 md:p-10 border-t-2 border-transparent hover:border-primary transition-colors group"
                data-testid={`process-step-${i}`}
              >
                <p className="text-6xl font-bold text-white/5 font-mono mb-8 group-hover:text-white/10 transition-colors">{step.num}</p>
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 md:py-48 bg-black border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex flex-col items-center">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-6 font-display leading-[0.88]" data-testid="text-arch-cta-heading">READY TO<br />BUILD?</h2>
            <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto font-light leading-relaxed">
              Tell us what you're building — or what's not working. We'll be straight with you about how we can fix it.
            </p>

            {/* Admin: editable form URL */}
            {isAdmin && (
              <div className="mb-8 w-full max-w-sm border border-primary/30 bg-primary/5 p-5">
                <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-4">Admin — Set Form Link</p>
                {editingForm ? (
                  <div className="flex flex-col gap-3">
                    <input
                      className="w-full bg-black border border-primary/40 text-white text-xs px-4 py-3 outline-none focus:border-primary placeholder:text-gray-600"
                      placeholder="Paste Google Form link…"
                      value={draftForm}
                      onChange={(e) => setDraftForm(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={saveFormUrl}
                        disabled={savingForm}
                        className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Check size={11} /> Save
                      </button>
                      <button
                        onClick={() => setEditingForm(false)}
                        className="flex items-center gap-1 px-4 py-2 border border-white/20 text-gray-400 text-xs hover:text-white transition-colors"
                      >
                        <X size={11} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setDraftForm(architectsFormUrl); setEditingForm(true); }}
                    className="flex items-center justify-center gap-2 text-xs text-primary/80 hover:text-primary transition-colors w-full border border-dashed border-primary/30 py-3"
                  >
                    <Pencil size={11} />
                    {architectsFormUrl ? (
                      <span className="truncate px-2">{architectsFormUrl}</span>
                    ) : (
                      <span>Click to set Google Form link…</span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* CTA button */}
            {publicFormUrl ? (
              <a href={publicFormUrl} target="_blank" rel="noopener noreferrer" data-testid="link-arch-cta-form">
                <Button className="bg-white text-black hover:bg-gray-200 rounded-none px-12 py-8 uppercase tracking-[0.2em] text-sm font-bold hover:scale-105 transition-transform inline-flex items-center gap-3">
                  Start a Project <ArrowRight size={16} />
                </Button>
              </a>
            ) : (
               <Button
                disabled={!isAdmin}
                className="bg-white text-black hover:bg-gray-200 rounded-none px-12 py-8 uppercase tracking-[0.2em] text-sm font-bold inline-flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isAdmin ? "Add form link above to activate" : <>Start a Project <ArrowRight size={16} /></>}
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* CONTACT SUBMISSIONS INBOX — admin only */}
      {isAdmin && (
        <section className="py-20 bg-zinc-950 border-t border-primary/20">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex items-center gap-4 mb-8">
              <p className="text-xs uppercase tracking-[0.4em] font-bold text-primary">Admin Inbox</p>
              <span className="text-xs text-gray-500 font-mono">{submissions.length} submission{submissions.length !== 1 ? "s" : ""}</span>
            </div>
            {submissions.length === 0 ? (
              <div className="p-8 border border-white/5 bg-black text-center">
                <p className="text-gray-600 text-sm uppercase tracking-widest">No contact submissions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((s) => (
                  <div key={s.id} className="border border-white/5 bg-black p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-white font-bold text-sm">{s.name}</p>
                        <p className="text-gray-400 text-xs">{s.email}</p>
                      </div>
                      <span className="inline-block text-[9px] uppercase tracking-[0.4em] font-bold border border-white/10 px-2 py-1 text-gray-500">{s.inquiry}</span>
                      <p className="text-gray-600 text-[10px] font-mono">{new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="md:border-l border-white/10 md:pl-8">
                      <p className="text-gray-300 text-sm leading-relaxed">{s.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <Footer />

      <style>{`
        .uppy-dark-theme .uppy-Dashboard-inner { background-color: transparent !important; border: 1px dashed rgba(255,255,255,0.12) !important; }
        .uppy-dark-theme .uppy-Dashboard-innerWrap { background-color: transparent !important; }
        .uppy-dark-theme .uppy-DashboardTab-btn, .uppy-dark-theme .uppy-Dashboard-dropFilesTitle { color: white !important; }
      `}</style>
    </div>
  );
}
