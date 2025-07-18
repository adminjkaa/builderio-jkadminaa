import React, { useState } from "react";
import {
  FileImage,
  Video,
  Download,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Clock,
  Folder,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useData } from "@/lib/data-context";

interface ProjectMediaGalleryProps {
  projectName: string;
  open: boolean;
  onClose: () => void;
}

export const ProjectMediaGallery: React.FC<ProjectMediaGalleryProps> = ({
  projectName,
  open,
  onClose,
}) => {
  const { media, tasks } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">(
    "all",
  );
  const [organizationMode, setOrganizationMode] = useState<
    "task" | "date" | "days"
  >("task");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [viewingMedia, setViewingMedia] = useState<any>(null);

  // Get project tasks and their media
  const projectTasks = tasks.filter((task) => task.project === projectName);
  const projectMedia = media.filter((m) =>
    projectTasks.some((t) => t.id === m.taskId),
  );

  // Filter media based on search and type
  const filteredMedia = projectMedia.filter((mediaFile) => {
    const matchesSearch =
      mediaFile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mediaFile.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mediaFile.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || mediaFile.type === filterType;

    return matchesSearch && matchesType;
  });

  // Get task and media context
  const getMediaContext = (mediaFile: any) => {
    const task = projectTasks.find((t) => t.id === mediaFile.taskId);
    return { task };
  };

  // Organization functions
  const organizeByTask = () => {
    return filteredMedia.reduce(
      (groups, mediaFile) => {
        const { task } = getMediaContext(mediaFile);
        const taskName = task?.name || "Unknown Task";
        if (!groups[taskName]) {
          groups[taskName] = [];
        }
        groups[taskName].push(mediaFile);
        return groups;
      },
      {} as Record<string, typeof filteredMedia>,
    );
  };

  const organizeByDate = () => {
    return filteredMedia.reduce(
      (groups, mediaFile) => {
        const date = new Date(mediaFile.uploadedAt).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(mediaFile);
        return groups;
      },
      {} as Record<string, typeof filteredMedia>,
    );
  };

  const organizeByDays = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setDate(thisMonth.getDate() - 30);

    return filteredMedia.reduce(
      (groups, mediaFile) => {
        const uploadDate = new Date(mediaFile.uploadedAt);
        const uploadDateOnly = new Date(
          uploadDate.getFullYear(),
          uploadDate.getMonth(),
          uploadDate.getDate(),
        );

        let group = "Older";
        if (uploadDateOnly.getTime() === today.getTime()) {
          group = "Today";
        } else if (uploadDateOnly.getTime() === yesterday.getTime()) {
          group = "Yesterday";
        } else if (uploadDate >= thisWeek) {
          group = "This Week";
        } else if (uploadDate >= thisMonth) {
          group = "This Month";
        }

        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(mediaFile);
        return groups;
      },
      {} as Record<string, typeof filteredMedia>,
    );
  };

  const getOrganizedMedia = () => {
    switch (organizationMode) {
      case "task":
        return organizeByTask();
      case "date":
        return organizeByDate();
      case "days":
        return organizeByDays();
      default:
        return organizeByTask();
    }
  };

  const organizedMedia = getOrganizedMedia();

  const handleDownload = (mediaFile: any) => {
    const link = document.createElement("a");
    link.href = mediaFile.url;
    link.download = mediaFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMediaItem = (mediaFile: any, showTaskInfo = true) => {
    const { task } = getMediaContext(mediaFile);

    if (viewMode === "grid") {
      return (
        <div
          key={mediaFile.id}
          className="relative group bg-muted/50 rounded-lg overflow-hidden border"
        >
          {/* Media Content */}
          <div className="aspect-video relative">
            {mediaFile.type === "image" ? (
              <img
                src={mediaFile.url}
                alt={mediaFile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-muted">
                        <svg class="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Video className="w-8 h-8 text-muted-foreground" />
              </div>
            )}

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              {mediaFile.type === "image" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setViewingMedia(mediaFile)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDownload(mediaFile)}
                className="h-8 w-8 p-0"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Media Type Badge */}
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 text-xs"
            >
              {mediaFile.type}
            </Badge>
          </div>

          {/* Media Info */}
          <div className="p-3">
            <p
              className="text-sm font-medium truncate mb-1"
              title={mediaFile.name}
            >
              {mediaFile.name}
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {mediaFile.uploadedBy}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(mediaFile.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              {showTaskInfo && task && (
                <p className="text-xs text-primary">Task: {task.name}</p>
              )}
            </div>
            {mediaFile.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {mediaFile.description}
              </p>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div
          key={mediaFile.id}
          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          {/* Media Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {mediaFile.type === "image" ? (
              <img
                src={mediaFile.url}
                alt={mediaFile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-muted">
                        <svg class="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Media Info */}
          <div className="flex-1">
            <h4 className="font-medium">{mediaFile.name}</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <Badge variant="outline" className="text-xs">
                {mediaFile.type}
              </Badge>
              <span>By {mediaFile.uploadedBy}</span>
              <span>{new Date(mediaFile.uploadedAt).toLocaleDateString()}</span>
              {showTaskInfo && task && <span>Task: {task.name}</span>}
            </div>
            {mediaFile.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {mediaFile.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownload(mediaFile)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileImage className="w-5 h-5" />
              {projectName} - Media Gallery
            </DialogTitle>
            <DialogDescription>
              All media files uploaded for this project, organized by{" "}
              {organizationMode === "task"
                ? "task"
                : organizationMode === "date"
                  ? "date"
                  : "days"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search media files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as "all" | "image" | "video")
                  }
                >
                  <option value="all">All Media</option>
                  <option value="image">Images Only</option>
                  <option value="video">Videos Only</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-muted-foreground" />
                <select
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={organizationMode}
                  onChange={(e) =>
                    setOrganizationMode(
                      e.target.value as "task" | "date" | "days",
                    )
                  }
                >
                  <option value="task">By Task</option>
                  <option value="date">By Date</option>
                  <option value="days">By Days</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Media Content */}
            <ScrollArea className="h-[60vh] w-full">
              {filteredMedia.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">
                      {projectMedia.length === 0
                        ? "No Media Files"
                        : "No Results Found"}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {projectMedia.length === 0
                        ? "No images or videos have been uploaded for this project yet."
                        : "Try adjusting your search terms or filters to find the media you're looking for."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {Object.entries(organizedMedia).map(([groupName, files]) => (
                    <div key={groupName}>
                      <div className="flex items-center gap-3 mb-4 pb-2 border-b">
                        {organizationMode === "task" ? (
                          <Folder className="w-5 h-5 text-primary" />
                        ) : (
                          <Calendar className="w-5 h-5 text-primary" />
                        )}
                        <h4 className="text-lg font-semibold">{groupName}</h4>
                        <Badge variant="outline">{files.length} files</Badge>
                      </div>
                      <div
                        className={
                          viewMode === "grid"
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            : "space-y-3"
                        }
                      >
                        {files.map((mediaFile) =>
                          renderMediaItem(
                            mediaFile,
                            organizationMode !== "task",
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Viewer */}
      <Dialog open={!!viewingMedia} onOpenChange={() => setViewingMedia(null)}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 border-0">
          <div className="relative bg-black rounded-lg overflow-hidden">
            {viewingMedia && (
              <>
                <img
                  src={viewingMedia.url}
                  alt={viewingMedia.name}
                  className="w-full h-full max-h-[90vh] object-contain"
                />
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                  <p className="font-medium">{viewingMedia.name}</p>
                  <p className="text-sm opacity-90">
                    Uploaded by {viewingMedia.uploadedBy}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewingMedia(null)}
                  className="absolute top-4 right-4"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectMediaGallery;
