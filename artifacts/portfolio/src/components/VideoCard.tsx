import { Link } from "wouter";
import { motion } from "framer-motion";
import { Video } from "@workspace/api-client-react";

interface VideoCardProps {
  video: Video;
  index?: number;
  featured?: boolean;
  gridMode?: boolean;
}

export function VideoCard({ video, index = 0, featured = false, gridMode = false }: VideoCardProps) {
  const isYoutube = (path: string | null | undefined) => !!path?.startsWith("youtube:");
  const getYoutubeId = (path: string) => path.replace("youtube:", "");
  const getYoutubeThumbnail = () =>
    isYoutube(video.videoPath)
      ? `https://img.youtube.com/vi/${getYoutubeId(video.videoPath!)}/hqdefault.jpg`
      : null;

  const getThumbnail = () => {
    if (video.thumbnailPath) {
      return video.thumbnailPath.startsWith("/objects/")
        ? `/api/storage${video.thumbnailPath}`
        : video.thumbnailPath;
    }
    if (isYoutube(video.videoPath)) {
      return getYoutubeThumbnail()!;
    }
    return "/images/thumb-abstract.png";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`group relative block overflow-hidden ${gridMode ? "h-full" : featured ? "aspect-[21/9]" : video.orientation === "portrait" ? "aspect-[9/16]" : "aspect-video"} bg-black`}
    >
      <Link href={`/film/${video.id}`} className="absolute inset-0 z-20">
        <span className="sr-only">View {video.title}</span>
      </Link>
      
      {/* Thumbnail */}
      <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
        <img
          src={getThumbnail()}
          alt={video.title}
          onError={(e) => {
            const image = e.currentTarget;
            const youtubeThumbnail = getYoutubeThumbnail();
            if (youtubeThumbnail && !image.src.includes("/hqdefault.jpg")) {
              image.src = youtubeThumbnail;
            } else if (!image.src.endsWith("/images/thumb-abstract.png")) {
              image.src = "/images/thumb-abstract.png";
            }
          }}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity duration-700"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end z-10">
        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <span className="text-xs font-mono text-white/70 uppercase tracking-widest border border-white/20 px-2 py-1 bg-black/50 backdrop-blur-sm">
              {video.format || video.category}
            </span>
            {video.duration && (
              <span className="text-xs font-mono text-white/50">{video.duration}</span>
            )}
            {video.year && (
              <span className="text-xs font-mono text-white/50">{video.year}</span>
            )}
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2 md:mb-4 leading-tight line-clamp-3">
            {video.title}
          </h3>
          
          <p className={`text-gray-300 line-clamp-2 max-w-2xl ${featured ? 'text-base md:text-lg' : 'text-sm'} opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100`}>
            {video.description}
          </p>
          
          <div className="mt-4 md:mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
            <span className="text-sm font-bold uppercase tracking-widest text-white border-b border-white pb-1 inline-block">
              Watch Film
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
