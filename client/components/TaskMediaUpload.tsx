import React, { useState } from "react";
import { Camera, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth";

interface TaskMediaUploadProps {
  taskId: string;
  taskName?: string;
  variant?: "button" | "icon";
  size?: "sm" | "default" | "lg";
}

export const TaskMediaUpload: React.FC<TaskMediaUploadProps> = ({
  taskId,
  taskName,
  variant = "button",
  size = "sm",
}) => {
  const { addMedia } = useData();
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("Files selected:", files?.length || 0);
    setUploadFiles(files);
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error("No user available for media upload");
      alert("Error: User not authenticated. Please log in and try again.");
      return;
    }

    if (!uploadFiles || uploadFiles.length === 0) {
      console.error("No files selected for upload");
      alert("Please select at least one file to upload.");
      return;
    }

    setIsUploading(true);

    try {
      // Validate file types and sizes
      const validFiles = Array.from(uploadFiles).filter((file) => {
        const isValidType =
          file.type.startsWith("image/") || file.type.startsWith("video/");
        const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit

        if (!isValidType) {
          alert(`File "${file.name}" is not a valid image or video file.`);
          return false;
        }

        if (!isValidSize) {
          alert(`File "${file.name}" is too large. Maximum size is 50MB.`);
          return false;
        }

        return true;
      });

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      // Process each file
      for (const file of validFiles) {
        // Create object URL for preview
        const url = URL.createObjectURL(file);

        console.log("Adding media:", {
          name: file.name,
          type: file.type.startsWith("image/") ? "image" : "video",
          taskId: taskId,
          uploadedBy: user.username,
        });

        addMedia({
          name: file.name,
          url: url,
          type: file.type.startsWith("image/") ? "image" : "video",
          taskId: taskId,
          uploadedBy: user.username,
          description: description,
        });
      }

      // Reset form
      setUploadFiles(null);
      setDescription("");
      setShowDialog(false);
      setIsUploading(false);

      // Success feedback
      alert(`Successfully uploaded ${validFiles.length} file(s)!`);
    } catch (error) {
      console.error("Error uploading media:", error);
      alert("Error uploading files. Please try again.");
      setIsUploading(false);
    }
  };

  if (variant === "icon") {
    return (
      <>
        <Button
          size={size}
          variant="outline"
          onClick={() => setShowDialog(true)}
          className="h-8 w-8 p-0"
        >
          <Camera className="w-4 h-4" />
        </Button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
              <DialogDescription>
                Upload photos or videos for {taskName || "this task"}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Files</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
                {uploadFiles && uploadFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {uploadFiles.length} file(s) selected
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Add a description for your upload..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !uploadFiles || uploadFiles.length === 0 || isUploading
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button size={size} variant="outline" onClick={() => setShowDialog(true)}>
        <Camera className="w-4 h-4 mr-2" />
        Upload Media
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Upload photos or videos for {taskName || "this task"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upload Files</Label>
              <Input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              {uploadFiles && uploadFiles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {uploadFiles.length} file(s) selected
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Add a description for your upload..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!uploadFiles || uploadFiles.length === 0 || isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskMediaUpload;
