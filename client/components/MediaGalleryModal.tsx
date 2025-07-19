import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Download,
  Maximize,
  Search,
  Filter,
  Calendar,
  FileImage,
  Video,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useData, type MediaFile, type Task } from "@/lib/data-context";

interface MediaWithTaskInfo extends MediaFile {
  taskName: string;
  taskTrade: string;
}

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectMedia: MediaFile[];
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({
  isOpen,
  onClose,
  projectName,
  projectMedia,
}) => {
  const { tasks } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "task" | "name">("date");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">(
    "all",
  );
  const [fullscreenMedia, setFullscreenMedia] =
    useState<MediaWithTaskInfo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get task info for each media file
  const mediaWithTaskInfo = useMemo(() => {
    return projectMedia.map((media): MediaWithTaskInfo => {
      const task = tasks.find((t) => t.id === media.taskId);
      return {
        ...media,
        taskName: task?.name || "Unknown Task",
        taskTrade: task?.trade || "",
      };
    });
  }, [projectMedia, tasks]);

  // Filter and sort media
  const filteredAndSortedMedia = useMemo(() => {
    let filtered = mediaWithTaskInfo.filter((media) => {
      const matchesSearch =
        media.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        media.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (media.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType = filterType === "all" || media.type === filterType;

      return matchesSearch && matchesType;
    });

    // Sort media
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
        case "task":
          return a.taskName.localeCompare(b.taskName);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [mediaWithTaskInfo, searchTerm, sortBy, filterType]);

  // Group media by task for organized view
  const mediaByTask = useMemo(() => {
    const grouped = filteredAndSortedMedia.reduce(
      (acc, media) => {
        const taskName = media.taskName;
        if (!acc[taskName]) {
          acc[taskName] = [];
        }
        acc[taskName].push(media);
        return acc;
      },
      {} as Record<string, typeof filteredAndSortedMedia>,
    );

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredAndSortedMedia]);

  const downloadMedia = (media: MediaFile) => {
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = media.url;
    link.download = media.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFullscreen = (media: MediaFile) => {
    setFullscreenMedia(media);
    setCurrentIndex(filteredAndSortedMedia.findIndex((m) => m.id === media.id));
  };

  const closeFullscreen = () => {
    setFullscreenMedia(null);
  };

  const navigateFullscreen = (direction: "prev" | "next") => {
    if (!fullscreenMedia) return;

    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % filteredAndSortedMedia.length
        : (currentIndex - 1 + filteredAndSortedMedia.length) %
          filteredAndSortedMedia.length;

    setCurrentIndex(newIndex);
    setFullscreenMedia(filteredAndSortedMedia[newIndex]);
  };

  const MediaCard = ({ media }: { media: MediaWithTaskInfo }) => (
    <div className="group relative bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {media.type === "image" ? (
          <img
            src={media.url}
            alt={media.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Video className="w-12 h-12 text-gray-400" />
            <video
              src={media.url}
              className="absolute inset-0 w-full h-full object-cover"
              muted
            />
          </div>
        )}

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openFullscreen(media)}
              className="bg-white/90 hover:bg-white text-gray-900"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => downloadMedia(media)}
              className="bg-white/90 hover:bg-white text-gray-900"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            {media.type === "image" ? (
              <FileImage className="w-3 h-3" />
            ) : (
              <Video className="w-3 h-3" />
            )}
          </Badge>
        </div>
      </div>

      <div className="p-3">
        <h4 className="font-medium text-sm text-gray-900 truncate">
          {media.name}
        </h4>
        <p className="text-xs text-gray-500 mt-1">{media.taskName}</p>
        {media.taskTrade && (
          <p className="text-xs text-gray-400">{media.taskTrade}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">
            {new Date(media.uploadedAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-400">{media.uploadedBy}</p>
        </div>
        {media.description && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {media.description}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Main Gallery Modal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileImage className="w-5 h-5" />
              {projectName} - Media Gallery
            </DialogTitle>
            <DialogDescription>
              {filteredAndSortedMedia.length} media files
            </DialogDescription>
          </DialogHeader>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search media, tasks, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <select
                className="px-3 py-2 border rounded-md text-sm bg-white"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "task" | "name")
                }
              >
                <option value="date">Sort by Date</option>
                <option value="task">Sort by Task</option>
                <option value="name">Sort by Name</option>
              </select>

              <select
                className="px-3 py-2 border rounded-md text-sm bg-white"
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as "all" | "image" | "video")
                }
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
            </div>
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredAndSortedMedia.length === 0 ? (
              <div className="text-center py-12">
                <FileImage className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No media found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : sortBy === "task" ? (
              /* Grouped by task view */
              <div className="space-y-6">
                {mediaByTask.map(([taskName, taskMedia]) => (
                  <div key={taskName}>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {taskName}
                      <Badge variant="outline">{taskMedia.length} files</Badge>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {taskMedia.map((media) => (
                        <MediaCard key={media.id} media={media} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Grid view */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAndSortedMedia.map((media) => (
                  <MediaCard key={media.id} media={media} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Media Modal */}
      {fullscreenMedia && (
        <Dialog open={!!fullscreenMedia} onOpenChange={closeFullscreen}>
          <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden bg-black">
            <div className="relative w-full h-[95vh]">
              {/* Navigation */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => downloadMedia(fullscreenMedia)}
                  className="bg-white/90 hover:bg-white text-gray-900"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={closeFullscreen}
                  className="bg-white/90 hover:bg-white text-gray-900"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation arrows */}
              {filteredAndSortedMedia.length > 1 && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigateFullscreen("prev")}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-900"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigateFullscreen("next")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-900"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Media content */}
              <div className="w-full h-full flex items-center justify-center">
                {fullscreenMedia.type === "image" ? (
                  <img
                    src={fullscreenMedia.url}
                    alt={fullscreenMedia.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video
                    src={fullscreenMedia.url}
                    controls
                    className="max-w-full max-h-full"
                    autoPlay
                  />
                )}
              </div>

              {/* Media info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="text-white">
                  <h3 className="text-lg font-semibold">
                    {fullscreenMedia.name}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {fullscreenMedia.taskName}
                  </p>
                  {fullscreenMedia.description && (
                    <p className="text-sm text-gray-300 mt-1">
                      {fullscreenMedia.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>Uploaded by {fullscreenMedia.uploadedBy}</span>
                    <span>
                      {new Date(fullscreenMedia.uploadedAt).toLocaleString()}
                    </span>
                    <span>
                      {currentIndex + 1} of {filteredAndSortedMedia.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default MediaGalleryModal;
