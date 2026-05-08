import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ObjectUploader } from "@workspace/object-storage-web";
import { useCreateVideo, useRequestUploadUrl } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  duration: z.string().optional(),
  year: z.coerce.number().optional(),
  director: z.string().optional(),
  tags: z.string().optional(), // We'll split this by comma
});

type FormValues = z.infer<typeof formSchema>;

export default function Upload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);

  const createVideo = useCreateVideo();
  const requestUrl = useRequestUploadUrl();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      featured: false,
      duration: "",
      year: new Date().getFullYear(),
      director: "Monkmonkeyworks AI",
      tags: "",
    },
  });

  const handleGetUploadParams = async (file: any) => {
    try {
      const { uploadURL } = await requestUrl.mutateAsync({
        data: {
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }
      });
      
      return {
        method: "PUT",
        url: uploadURL,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      };
    } catch (err) {
      console.error("Failed to get upload URL:", err);
      throw err;
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!videoPath) {
      toast({
        title: "Error",
        description: "Please upload a video file first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const tags = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      
      await createVideo.mutateAsync({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          featured: data.featured,
          duration: data.duration,
          year: data.year,
          director: data.director,
          tags,
          videoPath,
          thumbnailPath,
        }
      });

      toast({
        title: "Success",
        description: "Film has been successfully published to the archive.",
      });
      
      setLocation("/films");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish film.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-24 text-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 md:px-12 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 border-b border-white/10 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 uppercase">Admin Upload</h1>
            <p className="text-gray-400 font-light">Publish a new film to the Monkmonkeyworks archive.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Upload Area */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              <Card className="bg-black border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-bold uppercase tracking-widest text-sm mb-4 border-b border-white/10 pb-2">Video File *</h3>
                  {videoPath ? (
                    <div className="bg-green-950/30 border border-green-900/50 p-4 text-green-400 text-sm font-mono break-all">
                      Uploaded: {videoPath}
                    </div>
                  ) : (
                    <div className="min-h-[150px] uppy-dark-theme">
                      <ObjectUploader
                        onGetUploadParameters={handleGetUploadParams}
                        onComplete={(result) => {
                          if (result?.objectPath) {
                            setVideoPath(result.objectPath);
                          }
                        }}
                      >
                        Select Video
                      </ObjectUploader>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-bold uppercase tracking-widest text-sm mb-4 border-b border-white/10 pb-2">Thumbnail Cover</h3>
                  {thumbnailPath ? (
                    <div className="bg-green-950/30 border border-green-900/50 p-4 text-green-400 text-sm font-mono break-all">
                      Uploaded: {thumbnailPath}
                    </div>
                  ) : (
                    <div className="min-h-[150px] uppy-dark-theme">
                      <ObjectUploader
                        onGetUploadParameters={handleGetUploadParams}
                        onComplete={(result) => {
                          if (result?.objectPath) {
                            setThumbnailPath(result.objectPath);
                          }
                        }}
                      >
                        Select Image
                      </ObjectUploader>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Form Area */}
            <div className="lg:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-widest text-xs text-gray-400 font-bold">Film Title</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. Neon Genesis..." className="bg-black border-white/20 text-white font-display text-lg" {...field} />
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
                        <FormLabel className="uppercase tracking-widest text-xs text-gray-400 font-bold">Synopsis / Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A brief description of the film..." 
                            className="min-h-[150px] bg-black border-white/20 text-white resize-y" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-widest text-xs text-gray-400 font-bold">Category</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. Sci-Fi, Abstract, Narrative" className="bg-black border-white/20 text-white" {...field} />
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
                          <FormLabel className="uppercase tracking-widest text-xs text-gray-400 font-bold">Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. 2:45" className="bg-black border-white/20 text-white font-mono" {...field} />
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
                          <FormLabel className="uppercase tracking-widest text-xs text-gray-400 font-bold">Director</FormLabel>
                          <FormControl>
                            <Input placeholder="Director name" className="bg-black border-white/20 text-white" {...field} />
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
                          <FormLabel className="uppercase tracking-widest text-xs text-gray-400 font-bold">Release Year</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2025" className="bg-black border-white/20 text-white font-mono" {...field} />
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
                        <FormLabel className="uppercase tracking-widest text-xs text-gray-400 font-bold">Tags (Comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="AI, Unreal Engine, Cyberpunk..." className="bg-black border-white/20 text-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/10 bg-black/50 p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="uppercase tracking-widest text-xs font-bold text-white">
                            Feature this film
                          </FormLabel>
                          <FormDescription className="text-gray-500">
                            Featured films appear larger on the homepage and archive grid.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="pt-8 flex justify-end">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={createVideo.isPending || !videoPath}
                      className="bg-white text-black hover:bg-gray-200 rounded-none px-12 uppercase tracking-widest font-bold"
                    >
                      {createVideo.isPending ? "Publishing..." : "Publish Film"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>

      {/* Add a tiny bit of global CSS just for this page to theme the Uppy dashboard darkly */}
      <style dangerouslySetContents={{__html: `
        .uppy-dark-theme .uppy-Dashboard-inner {
          background-color: transparent !important;
          border: 1px dashed rgba(255,255,255,0.2) !important;
        }
        .uppy-dark-theme .uppy-Dashboard-innerWrap {
          background-color: transparent !important;
        }
        .uppy-dark-theme .uppy-DashboardTab-btn,
        .uppy-dark-theme .uppy-Dashboard-dropFilesTitle {
          color: white !important;
        }
      `}} />
      <Footer />
    </div>
  );
}
