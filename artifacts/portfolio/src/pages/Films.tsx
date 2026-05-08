import { useState, useEffect } from "react";
import { useListVideos, useListCategories } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VideoCard } from "@/components/VideoCard";
import { motion } from "framer-motion";

export default function Studio() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  const { data: videos, isLoading: isLoadingVideos } = useListVideos({ category: selectedCategory });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col pt-24">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 md:px-12 py-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
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

        {/* Filters */}
        <div className="flex flex-wrap gap-6 mb-16 border-b border-white/10 pb-8">
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

          {!isLoadingCategories &&
            categories?.map((category) => (
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
        </div>

        {/* Grid */}
        {isLoadingVideos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {videos.map((video, idx) => (
              <VideoCard key={video.id} video={video} index={idx} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border border-white/5 bg-white/5">
            <h3 className="text-2xl text-white mb-4 tracking-tight">Nothing here yet</h3>
            <p className="text-gray-500 uppercase tracking-widest text-sm">
              Upload your first piece of work to get started
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
