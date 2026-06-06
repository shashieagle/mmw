import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Brain, BarChart3, Layers, Zap, Users, Globe, Upload, Trash2, X, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectUploader } from "@workspace/object-storage-web";
import { useRequestUploadUrl } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminMode } from "@/hooks/use-admin-mode";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const services = [
  {
    icon: Brain,
    title: "AI Strategy & Roadmapping",
    description: "Audit → roadmap → adoption. Clear path, zero buzzwords.",
  },
  {
    icon: Layers,
    title: "Custom AI Integration",
    description: "AI embedded directly into your operations — not bolted on.",
  },
  {
    icon: BarChart3,
    title: "Visual Content Automation",
    description: "Studio-quality visuals at business speed. No shoot required.",
  },
  {
    icon: Zap,
    title: "Rapid Prototyping",
    description: "Concept to working prototype in days, not months.",
  },
  {
    icon: Users,
    title: "Team Training & Workshops",
    description: "Hands-on AI upskilling for your actual team. Zero fluff.",
  },
  {
    icon: Globe,
    title: "Brand & Campaign Generation",
    description: "Full campaign assets at scale. Consistent voice, no bottlenecks.",
  },
];

const GRADIENTS = [
  { label: "Default Dark", value: "from-zinc-900/40 via-zinc-950 to-black" },
  { label: "Warm Amber", value: "from-amber-950/40 via-zinc-950 to-black" },
  { label: "Stone", value: "from-stone-900/40 via-zinc-950 to-black" },
  { label: "Orange", value: "from-orange-950/40 via-zinc-950 to-black" },
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
    <div className="mt-10 border-t border-white/10 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold">
          Gallery {media.length > 0 && <span className="text-gray-700 ml-2">({media.length})</span>}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-white/5 animate-pulse" />)}
        </div>
      ) : media.length === 0 ? (
        <div className="border border-dashed border-white/10 py-10 text-center">
          <Upload className="mx-auto mb-3 text-gray-700" size={20} />
          <p className="text-gray-700 text-xs uppercase tracking-widest">No media yet — use Add Media above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative group aspect-square overflow-hidden bg-zinc-900 cursor-pointer"
              onClick={() => !isAdmin && setLightbox(item)}
            >
              {item.mediaType === "video" ? (
                <video
                  src={getMediaDisplayUrl(item.mediaPath)}
                  className="w-full h-full object-cover"
                  muted playsInline
                  onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                  onMouseOut={(e) => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
                />
              ) : (
                <img src={getMediaDisplayUrl(item.mediaPath)} alt={item.caption || "Gallery"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-2">
                {isAdmin ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                    disabled={deleteMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 bg-black/80 p-2"
                  >
                    <Trash2 size={15} />
                  </button>
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 border border-white flex items-center justify-center">
                    <span className="text-white text-[10px]">↗</span>
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
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"><X size={24} /></button>
          <div className="max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
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

function KnownForSection() {
  const [revealed, setRevealed] = useState(false);

  return (
    <section className="py-16 md:py-20 bg-background border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.4em] text-gray-600 font-bold">Capabilities</p>
          <button
            onClick={() => setRevealed(!revealed)}
            className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] font-bold text-gray-500 hover:text-white border border-white/10 hover:border-white/30 px-6 py-3 transition-all duration-300 group"
          >
            {revealed ? "Hide" : "What we're known for"}
            <motion.span
              animate={{ rotate: revealed ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-base leading-none"
            >
              +
            </motion.span>
          </button>
        </div>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="overflow-hidden"
            >
              <div className="divide-y divide-white/5 border-t border-white/5 mt-10">
                {services.map((service, i) => (
                  <div key={i} className="flex items-center gap-6 py-5">
                    <span className="text-white/15 text-xs font-bold tracking-widest font-mono w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="text-sm md:text-base font-bold text-white tracking-tight">{service.title}</p>
                      <p className="text-gray-600 text-xs mt-1">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default function Architects() {
  const { isAdmin } = useAdminMode();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingStudy, setEditingStudy] = useState<CaseStudy | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CaseStudy | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

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
          <div className="bg-zinc-950 border border-white/10 p-8 max-w-sm w-full text-center">
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
      <section className="relative min-h-screen flex items-end pb-24 overflow-hidden pt-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-black to-black" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.21, 0.47, 0.32, 0.98] }}>
            <p className="text-xs uppercase tracking-[0.6em] text-gray-600 font-bold mb-8">Monkmonkeyworks — Business Division</p>
            <h1 className="text-7xl md:text-[9rem] lg:text-[12rem] font-bold tracking-tighter leading-[0.83] mb-10">
              Business
              <br />
              <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.25)" }}>Architects</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-xl leading-relaxed mb-12">
              Strategy, integration, and automation — from concept to scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="mailto:hello@monkmonkeyworks.com">
                <Button className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold">Start a Project</Button>
              </a>
              <a href="#case-studies">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold bg-transparent">
                  See Case Studies
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statement */}
      <section className="py-24 md:py-32 border-t border-white/5 bg-zinc-950">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight text-white"
          >
            AI isn't coming. It's already here — and your competitors are already using it.{" "}
            <span className="text-gray-500">We make sure you're not just keeping up, but pulling ahead.</span>
          </motion.p>
        </div>
      </section>

      {/* What We're Known For — accordion */}
      <KnownForSection />

      {/* Case Studies */}
      <section id="case-studies" className="py-24 md:py-32 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold mb-4">Proof of Work</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display">Case Studies</h2>
            </div>
            <div className="flex items-end gap-6">
              <p className="text-gray-600 max-w-xs text-sm leading-relaxed">Real projects. Real results. No vanity metrics — just business impact.</p>
              {isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  className="shrink-0 flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-white border border-white/20 hover:border-white/40 px-5 py-3 transition-colors"
                >
                  <Plus size={12} /> Add Case Study
                </button>
              )}
            </div>
          </div>

          {loadingStudies ? (
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 bg-white/5 animate-pulse border border-white/5" />
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
            <div className="space-y-6">
              {caseStudies.map((study, i) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.05 }}
                  className={`relative overflow-hidden border border-white/10 bg-gradient-to-br ${study.gradient} hover:border-white/20 transition-all duration-500`}
                >
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      <button
                        onClick={() => setEditingStudy(study)}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white bg-black/60 hover:bg-black/80 border border-white/10 hover:border-white/30 px-3 py-1.5 transition-all"
                      >
                        <Pencil size={10} /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(study)}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-400 bg-black/60 hover:bg-black/80 border border-red-500/20 hover:border-red-400/40 px-3 py-1.5 transition-all"
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    </div>
                  )}

                  <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                      <div className="flex-1">
                        <span className="inline-block text-[10px] uppercase tracking-[0.4em] font-bold text-gray-500 border border-white/10 px-3 py-1 mb-4">{study.tag}</span>
                        <p className="text-gray-500 text-sm mb-2">{study.client}</p>
                        <h3 className="text-2xl md:text-4xl font-bold tracking-tighter text-white leading-tight">{study.headline}</h3>
                      </div>
                      {study.stats.length > 0 && (
                        <div className="flex gap-8 shrink-0">
                          {study.stats.map((s, si) => (
                            <div key={si} className="text-center">
                              <p className="text-2xl md:text-3xl font-bold text-white font-mono">{s.value}</p>
                              <p className="text-[10px] uppercase tracking-widest text-gray-600 mt-1 max-w-[80px]">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 border-l-2 border-white/15 pl-6">
                        <p className="text-white text-sm font-mono leading-relaxed">{study.result}</p>
                      </div>
                      <div className="lg:col-span-8 lg:border-l border-white/10 lg:pl-10">
                        <p className="text-gray-400 text-base leading-relaxed">{study.detail}</p>
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
      <section className="py-24 md:py-32 bg-zinc-950 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold mb-4">How It Works</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display">Our Process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/5">
            {[
              { num: "01", title: "Discovery", desc: "We audit your current operations, understand your market, and identify where technology creates the most leverage." },
              { num: "02", title: "Blueprint", desc: "We design a precise implementation plan — tools, timelines, costs, and expected ROI. No ambiguity." },
              { num: "03", title: "Build", desc: "We build and integrate. Working solutions fast, full deployment with your team trained and ready." },
              { num: "04", title: "Scale", desc: "We stay on to optimize, iterate, and expand as your capability grows and new opportunities emerge." },
            ].map((step, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-zinc-950 p-8 md:p-10"
              >
                <p className="text-6xl font-bold text-white/5 font-mono mb-6">{step.num}</p>
                <h3 className="text-base font-bold text-white mb-3 uppercase tracking-widest">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 md:py-48 bg-background border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-6 font-display leading-[0.88]">READY TO<br />BUILD?</h2>
            <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
              Tell us what you're building — or what's not working. We'll be straight with you about how technology can fix it.
            </p>
            <Link href="/catalyst">
              <Button className="bg-white text-black hover:bg-gray-200 rounded-none px-12 py-8 uppercase tracking-[0.2em] text-sm font-bold hover:scale-105 transition-transform inline-flex items-center gap-3">
                Catalyst <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />

      <style>{`
        .uppy-dark-theme .uppy-Dashboard-inner { background-color: transparent !important; border: 1px dashed rgba(255,255,255,0.12) !important; }
        .uppy-dark-theme .uppy-Dashboard-innerWrap { background-color: transparent !important; }
        .uppy-dark-theme .uppy-DashboardTab-btn, .uppy-dark-theme .uppy-Dashboard-dropFilesTitle { color: white !important; }
      `}</style>
    </div>
  );
}
