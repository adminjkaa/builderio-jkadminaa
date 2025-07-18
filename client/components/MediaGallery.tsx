import React, { useState } from "react";
import {
  FileImage,
  Video,
  Download,
  Search,
  Filter,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/lib/data-context";

export const MediaGallery: React.FC = () => {
  const { media, tasks, projects } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">(
    "all",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter media based on search and type
  const filteredMedia = media.filter((mediaFile) => {
    const matchesSearch =
      mediaFile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mediaFile.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mediaFile.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || mediaFile.type === filterType;

    return matchesSearch && matchesType;
  });

  // Get task and project info for each media file
  const getMediaContext = (mediaFile: any) => {
    const task = tasks.find((t) => t.id === mediaFile.taskId);
    const project = projects.find((p) => p.name === task?.project);
    return { task, project };
  };

  const handleDownload = (mediaFile: any) => {
    const link = document.createElement("a");
    link.href = mediaFile.url;
    link.download = mediaFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Media Gallery</h3>
          <p className="text-sm text-muted-foreground">
            View all uploaded images and videos from all projects
          </p>
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

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
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
      </div>

      {/* Media Content */}
      {filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {media.length === 0 ? "No Media Files" : "No Results Found"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {media.length === 0
                ? "No images or videos have been uploaded yet. Media files will appear here once they are uploaded to tasks."
                : "Try adjusting your search terms or filters to find the media you're looking for."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="w-5 h-5" />
              Media Files ({filteredMedia.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMedia.map((mediaFile) => {
                  const { task, project } = getMediaContext(mediaFile);
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
                                    <div class="text-center">
                                      <div class="w-8 h-8 mx-auto mb-2 text-muted-foreground">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                        </svg>
                                      </div>
                                      <p class="text-xs text-muted-foreground">Image</p>
                                    </div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <div className="text-center">
                              <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                Video
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
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
                              {new Date(
                                mediaFile.uploadedAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          {project && (
                            <p className="text-xs text-primary">
                              Project: {project.name}
                            </p>
                          )}
                          {task && (
                            <p className="text-xs text-muted-foreground">
                              Task: {task.name}
                            </p>
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
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMedia.map((mediaFile) => {
                  const { task, project } = getMediaContext(mediaFile);
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
                          <span>
                            {new Date(
                              mediaFile.uploadedAt,
                            ).toLocaleDateString()}
                          </span>
                          {project && <span>Project: {project.name}</span>}
                          {task && <span>Task: {task.name}</span>}
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
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaGallery;
