import React, { useState } from "react";
import { X, Download, FileImage, Video, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MediaFile } from "@/lib/data-context";

interface MediaPreviewProps {
  media: MediaFile[];
  onDelete?: (mediaId: string) => void;
  onEdit?: (
    mediaId: string,
    updates: { name?: string; description?: string },
  ) => void;
  showDelete?: boolean;
  showEdit?: boolean;
  currentUserId?: string;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  media,
  onDelete,
  onEdit,
  showDelete = false,
  showEdit = false,
  currentUserId,
}) => {
  const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [viewingMedia, setViewingMedia] = useState<MediaFile | null>(null);

  const handleEdit = (mediaFile: MediaFile) => {
    setEditingMedia(mediaFile);
    setEditForm({
      name: mediaFile.name,
      description: mediaFile.description || "",
    });
  };

  const handleSaveEdit = () => {
    if (editingMedia && onEdit) {
      onEdit(editingMedia.id, editForm);
      setEditingMedia(null);
      setEditForm({ name: "", description: "" });
    }
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No media uploaded yet
      </div>
    );
  }

  const handleDownload = (mediaFile: MediaFile) => {
    const link = document.createElement("a");
    link.href = mediaFile.url;
    link.download = mediaFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileImage className="w-4 h-4" />
        <span className="text-sm font-medium">Media ({media.length})</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {media.map((mediaFile) => (
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
                    // Fallback if image fails to load
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
                    <p className="text-xs text-muted-foreground">Video</p>
                  </div>
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
                {showEdit &&
                  onEdit &&
                  (!currentUserId ||
                    mediaFile.uploadedBy === currentUserId) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(mediaFile)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                {showDelete && onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(mediaFile.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
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
            <div className="p-2">
              <p
                className="text-xs font-medium truncate"
                title={mediaFile.name}
              >
                {mediaFile.name}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {mediaFile.uploadedBy}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(mediaFile.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              {mediaFile.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {mediaFile.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Media Dialog */}
      <Dialog open={!!editingMedia} onOpenChange={() => setEditingMedia(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
            <DialogDescription>
              Update the name and description for this media file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="media-name">File Name</Label>
              <Input
                id="media-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter file name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="media-description">Description</Label>
              <Textarea
                id="media-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditingMedia(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
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
    </div>
  );
};

export default MediaPreview;
