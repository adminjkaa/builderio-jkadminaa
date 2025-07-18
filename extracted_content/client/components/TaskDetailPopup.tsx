import React from "react";
import {
  Calendar,
  Clock,
  TrendingUp,
  MessageSquare,
  FileImage,
  Video,
  Download,
  User,
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Task } from "@/lib/data-context";

interface TaskDetailPopupProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

export const TaskDetailPopup: React.FC<TaskDetailPopupProps> = ({
  task,
  open,
  onClose,
}) => {
  if (!task) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "in-progress":
        return "bg-info text-info-foreground";
      case "delayed":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "text-success";
    if (progress >= 50) return "text-info";
    if (progress > 0) return "text-warning";
    return "text-muted-foreground";
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{task.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Task details, progress updates, and media files
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Task Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Task Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Project
                    </p>
                    <p className="text-sm">{task.project}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Trade
                    </p>
                    <p className="text-sm">{task.trade}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Due Date
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Priority
                    </p>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority} priority
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${getProgressColor(task.progress)}`}
                      >
                        {task.progress}%
                      </span>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary rounded-full h-3 transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Comments */}
            {task.progressComments && task.progressComments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Progress Comments ({task.progressComments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {task.progressComments
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime(),
                      )
                      .map((comment) => (
                        <div
                          key={comment.id}
                          className="border-l-4 border-primary/20 pl-4 py-2"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {comment.userName}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>
                                {new Date(
                                  comment.timestamp,
                                ).toLocaleDateString()}
                              </span>
                              <span>
                                {new Date(
                                  comment.timestamp,
                                ).toLocaleTimeString()}
                              </span>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>
                                  {comment.previousProgress}% →{" "}
                                  {comment.newProgress}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm bg-muted/50 rounded p-2">
                            {comment.comment}
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Media Files */}
            {task.media && task.media.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    Media Files ({task.media.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {task.media.map((mediaFile) => (
                      <div
                        key={mediaFile.id}
                        className="relative group bg-muted/50 rounded-lg overflow-hidden border aspect-video"
                      >
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
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
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

                        {/* Media Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2">
                          <p className="text-xs font-medium truncate">
                            {mediaFile.name}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span>{mediaFile.uploadedBy}</span>
                            <span>
                              {new Date(
                                mediaFile.uploadedAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty States */}
            {(!task.progressComments || task.progressComments.length === 0) &&
              (!task.media || task.media.length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Updates Yet
                    </h3>
                    <p className="text-muted-foreground">
                      Progress comments and media uploads will appear here as
                      team members work on this task.
                    </p>
                  </CardContent>
                </Card>
              )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailPopup;
