import { useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetVideo, useUpdateVideo, useDeleteVideo } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Edit2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const editFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  duration: z.string().optional(),
  year: z.coerce.number().optional(),
  director: z.string().optional(),
  tags: z.string().optional(),
});

type EditFormValues = z.infer<typeof editFormSchema>;

export default function FilmDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: video, isLoading, refetch } = useGetVideo(id, { query: { enabled: !!id } });
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      featured: false,
      duration: "",
      year: new Date().getFullYear(),
      director: "",
      tags: "",
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (video && isEditDialogOpen) {
      form.reset({
        title: video.title,
        description: video.description,
        category: video.category,
        featured: video.featured,
        duration: video.duration || "",
        year: video.year || undefined,
        director: video.director || "",
        tags: video.tags ? video.tags.join(", ") : "",
      });
    }
  }, [video, isEditDialogOpen, form]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-sm uppercase tracking-widest animate-pulse">Loading Reel...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-24">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-4xl text-white font-bold mb-4">Film Not Found</h1>
          <Link href="/films" className="text-gray-400 hover:text-white uppercase tracking-widest text-sm border-b border-current pb-1">
            Return to Archive
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const getMediaUrl = (path: string) => {
    if (!path) return "";
    return path.startsWith("/objects/") ? `/api/storage${path}` : path;
  };

  const handleEditSubmit = async (data: EditFormValues) => {
    try {
      const tags = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      
      await updateVideo.mutateAsync({
        id,
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          featured: data.featured,
          duration: data.duration,
          year: data.year,
          director: data.director,
          tags,
        }
      });

      toast({
        title: "Success",
        description: "Film metadata updated.",
      });
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update film.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVideo.mutateAsync({ id });
      toast({
        title: "Deleted",
        description: "Film has been removed from the archive.",
      });
      setLocation("/films");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete film.",
        variant: "destructive",
      });
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col text-white font-sans selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* Video Player Section */}
        <section className="relative w-full h-[60vh] md:h-screen bg-black pt-20 md:pt-0 group">
          {video.videoPath ? (
            <>
              <video 
                ref={videoRef}
                src={getMediaUrl(video.videoPath)}
                poster={video.thumbnailPath ? getMediaUrl(video.thumbnailPath) : undefined}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover md:object-contain bg-black"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div 
                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 cursor-pointer ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                onClick={togglePlay}
              >
                {!isPlaying && (
                  <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <Play className="text-white ml-2 w-8 h-8" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 border-b border-white/10">
              <span className="text-gray-500 uppercase tracking-widest">Video file unavailable</span>
            </div>
          )}
        </section>

        {/* Film Details */}
        <section className="bg-background py-16 md:py-32">
          <div className="container mx-auto px-6 md:px-12 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <Link href="/films" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold">
                <ArrowLeft size={16} /> Back to Archive
              </Link>

              {/* Admin Actions */}
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-sm">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 mr-2 px-2">Admin</span>
                
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 text-xs uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10">
                      <Edit2 size={14} className="mr-2" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-display font-bold uppercase tracking-tighter">Edit Metadata</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4 mt-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase tracking-widest text-gray-400">Title</FormLabel>
                              <FormControl>
                                <Input className="bg-black border-white/20 text-white font-display text-lg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase tracking-widest text-gray-400">Description</FormLabel>
                              <FormControl>
                                <Textarea className="min-h-[100px] bg-black border-white/20 text-white" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase tracking-widest text-gray-400">Category</FormLabel>
                                <FormControl>
                                  <Input className="bg-black border-white/20 text-white" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="director"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase tracking-widest text-gray-400">Director</FormLabel>
                                <FormControl>
                                  <Input className="bg-black border-white/20 text-white" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase tracking-widest text-gray-400">Year</FormLabel>
                                <FormControl>
                                  <Input type="number" className="bg-black border-white/20 text-white" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase tracking-widest text-gray-400">Duration</FormLabel>
                                <FormControl>
                                  <Input className="bg-black border-white/20 text-white font-mono" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase tracking-widest text-gray-400">Tags (comma separated)</FormLabel>
                              <FormControl>
                                <Input className="bg-black border-white/20 text-white" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="featured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-4">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-xs uppercase tracking-widest text-white">Featured</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <div className="pt-4 flex justify-end gap-2">
                          <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="uppercase text-xs tracking-widest">Cancel</Button>
                          <Button type="submit" disabled={updateVideo.isPending} className="bg-white text-black hover:bg-gray-200 uppercase text-xs tracking-widest font-bold">
                            {updateVideo.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 text-xs uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 size={14} className="mr-2" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-950 border-red-900/50 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display text-2xl uppercase tracking-tighter">Delete Film</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        This action cannot be undone. This will permanently remove {video.title} from the archive.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10 uppercase text-xs tracking-widest">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={deleteVideo.isPending} className="bg-red-600 text-white hover:bg-red-700 uppercase text-xs tracking-widest font-bold border-none">
                        {deleteVideo.isPending ? "Deleting..." : "Delete Permanently"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              {/* Main Info */}
              <div className="lg:col-span-8">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.9]"
                >
                  {video.title}
                </motion.h1>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed whitespace-pre-wrap"
                >
                  {video.description}
                </motion.div>
              </div>

              {/* Metadata Sidebar */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-4 flex flex-col gap-8 border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-12"
              >
                <div>
                  <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Category</h4>
                  <p className="text-lg text-white capitalize">{video.category}</p>
                </div>
                
                {video.director && (
                  <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Director</h4>
                    <p className="text-lg text-white">{video.director}</p>
                  </div>
                )}
                
                {video.year && (
                  <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Year</h4>
                    <p className="text-lg text-white font-mono">{video.year}</p>
                  </div>
                )}
                
                {video.duration && (
                  <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Duration</h4>
                    <p className="text-lg text-white font-mono">{video.duration}</p>
                  </div>
                )}

                {video.tags && video.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-bold">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-3 py-1 border border-white/20 text-gray-300 bg-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
