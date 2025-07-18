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

  const handleSubmit = () => {
    if (uploadFiles && uploadFiles.length > 0 && user) {
      Array.from(uploadFiles).forEach((file) => {
        // Create object URL for preview
        const url = URL.createObjectURL(file);
        addMedia({
          name: file.name,
          url: url,
          type: file.type.startsWith("image/") ? "image" : "video",
          taskId: taskId,
          uploadedBy: user.username,
          description: description,
        });
      });

      // Reset form
      setUploadFiles(null);
      setDescription("");
      setShowDialog(false);
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
                  onChange={(e) => setUploadFiles(e.target.files)}
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
                disabled={!uploadFiles || uploadFiles.length === 0}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
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
                onChange={(e) => setUploadFiles(e.target.files)}
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
              disabled={!uploadFiles || uploadFiles.length === 0}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskMediaUpload;
