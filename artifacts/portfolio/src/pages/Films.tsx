import { useState, useEffect, useMemo } from "react";
import { useListVideos, useListCategories } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VideoCard } from "@/components/VideoCard";
import { motion, AnimatePresence } from "framer-motion";

export default function Studio() {
  const [selectedFormat, setSelectedFormat] = useState<string | undefined>(undefined);
  const [selectedIndustry, setSelectedIndustry] = useState<string | undefined>(undefined);

  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  const { data: allVideos, isLoading: isLoadingVideos } = useListVideos({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const industries = useMemo(() => {
    if (!allVideos) return [];
    const set = new Set<string>();
    allVideos.forEach((v) => (v.tags ?? []).forEach((t: string) => set.add(t)));
    return Array.from(set).sort();
  }, [allVideos]);

  const videos = useMemo(() => {
    if (!allVideos) return [];
    return allVideos.filter((v) => {
      const matchFormat = !selectedFormat || v.category === selectedFormat;
      const matchIndustry = !selectedIndustry || (v.tags ?? []).includes(selectedIndustry);
      return matchFormat && matchIndustry;
    });
  }, [allVideos, selectedFormat, selectedIndustry]);

  const FilterBtn = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`text-xs uppercase tracking-widest font-bold transition-all duration-300 pb-1 border-b-2 whitespace-nowrap ${
        active
          ? "text-white border-white"
          : "text-gray-500 border-transparent hover:text-gray-300 hover:border-white/20"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col pt-24">
      <Navbar />

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

        {/* Two-level filters */}
        <div className="mb-16 space-y-0">
          {/* Row 1 — Format */}
          <div className="border-t border-white/10 pt-6 pb-5">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-700 font-bold mb-4">Format</p>
            <div className="flex flex-wrap gap-6">
              <FilterBtn
                label="All Formats"
                active={selectedFormat === undefined}
                onClick={() => setSelectedFormat(undefined)}
              />
              {!isLoadingCategories &&
                categories?.map((cat) => (
                  <FilterBtn
                    key={cat}
                    label={cat}
                    active={selectedFormat === cat}
                    onClick={() => setSelectedFormat(selectedFormat === cat ? undefined : cat)}
                  />
                ))}
            </div>
          </div>

          {/* Row 2 — Industry */}
          {industries.length > 0 && (
            <div className="border-t border-white/10 pt-6 pb-8">
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-700 font-bold mb-4">Industry</p>
              <div className="flex flex-wrap gap-6">
                <FilterBtn
                  label="All Industries"
                  active={selectedIndustry === undefined}
                  onClick={() => setSelectedIndustry(undefined)}
                />
                {industries.map((ind) => (
                  <FilterBtn
                    key={ind}
                    label={ind}
                    active={selectedIndustry === ind}
                    onClick={() => setSelectedIndustry(selectedIndustry === ind ? undefined : ind)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active filter summary */}
          <AnimatePresence>
            {(selectedFormat || selectedIndustry) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 pb-6 flex-wrap">
                  <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Showing:</span>
                  {selectedFormat && (
                    <span className="text-[10px] uppercase tracking-widest font-bold text-white border border-white/20 px-3 py-1">
                      {selectedFormat}
                    </span>
                  )}
                  {selectedIndustry && (
                    <span className="text-[10px] uppercase tracking-widest font-bold text-white border border-white/20 px-3 py-1">
                      {selectedIndustry}
                    </span>
                  )}
                  <button
                    onClick={() => { setSelectedFormat(undefined); setSelectedIndustry(undefined); }}
                    className="text-[10px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors underline"
                  >
                    Clear all
                  </button>
                  <span className="text-gray-700 text-xs ml-auto">{videos.length} result{videos.length !== 1 ? "s" : ""}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grid */}
        {isLoadingVideos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"
          >
            <AnimatePresence mode="popLayout">
              {videos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                >
                  <VideoCard video={video} index={idx} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-32 text-center border border-white/5 bg-white/5">
            <h3 className="text-2xl text-white mb-4 tracking-tight">No matches</h3>
            <p className="text-gray-500 uppercase tracking-widest text-sm mb-8">
              Try a different format or industry combination
            </p>
            <button
              onClick={() => { setSelectedFormat(undefined); setSelectedIndustry(undefined); }}
              className="text-xs uppercase tracking-widest font-bold text-white border border-white/20 px-6 py-3 hover:bg-white/5 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
