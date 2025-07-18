import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Upload,
  CheckCircle,
  Clock,
  Camera,
  LogOut,
  FileImage,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-context";
import TaskMediaUpload from "@/components/TaskMediaUpload";

export default function MemberDashboard() {
  const { user, logout } = useAuth();
  const {
    tasks,
    updateTask,
    addMedia,
    updateTaskProgress,
    updateMedia,
    deleteMedia,
  } = useData();
  const navigate = useNavigate();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState([0]);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [progressNotes, setProgressNotes] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleUploadMedia = (taskId?: string) => {
    setSelectedTask(taskId || null);
    setUploadFiles(null);
    setUploadDescription("");
    setShowUploadDialog(true);
  };

  const handleUpdateProgress = (taskId?: string) => {
    if (taskId) {
      const task = assignedTasks.find((t) => t.id === taskId);
      if (task) {
        setProgressValue([task.progress]);
      }
    }
    setSelectedTask(taskId || null);
    setProgressNotes("");
    setShowProgressDialog(true);
  };

  const handleViewTaskDetails = (taskId: string) => {
    console.log("View task details:", taskId);
    alert(
      `Task details for: ${taskId}\nThis feature will be implemented soon.`,
    );
  };

  const handleSubmitUpload = () => {
    if (selectedTask && uploadFiles && uploadFiles.length > 0 && user) {
      Array.from(uploadFiles).forEach((file) => {
        const url = URL.createObjectURL(file);
        addMedia({
          name: file.name,
          url: url,
          type: file.type.startsWith("image/") ? "image" : "video",
          taskId: selectedTask,
          uploadedBy: user.username,
          description: uploadDescription,
        });
      });
      setShowUploadDialog(false);
      setUploadFiles(null);
      setUploadDescription("");
      setSelectedTask(null);
    }
  };

  const handleSubmitProgress = () => {
    if (selectedTask && user) {
      if (progressNotes.trim()) {
        updateTaskProgress(
          selectedTask,
          progressValue[0],
          progressNotes.trim(),
          user.id,
          user.name,
        );
      } else {
        updateTask(selectedTask, {
          progress: progressValue[0],
        });
      }
      setShowProgressDialog(false);
      setProgressNotes("");
      setProgressValue([0]);
      setSelectedTask(null);
    }
  };

  const handleEditMedia = (
    mediaId: string,
    updates: { name?: string; description?: string },
  ) => {
    updateMedia(mediaId, updates);
  };

  const handleDeleteMedia = (mediaId: string) => {
    if (confirm("Are you sure you want to delete this media file?")) {
      deleteMedia(mediaId);
    }
  };

  // Show all tasks for team members
  const assignedTasks = tasks;

  // Get recent uploads from tasks
  const recentUploads = assignedTasks
    .flatMap((task) =>
      task.media.map((media) => ({
        id: media.id,
        taskName: task.name,
        fileName: media.name,
        uploadedAt: media.uploadedAt,
      })),
    )
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "in-progress":
        return "bg-info text-info-foreground";
      case "planned":
        return "bg-muted text-muted-foreground";
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
        return "bg-orange-500 text-white";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-info rounded-lg">
                <Calendar className="w-6 h-6 text-info-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Member Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Assigned Tasks
                  </p>
                  <p className="text-2xl font-bold">{assignedTasks.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      assignedTasks.filter((t) => t.status === "in-progress")
                        .length
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Recent Uploads
                  </p>
                  <p className="text-2xl font-bold">{recentUploads.length}</p>
                </div>
                <Upload className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Tasks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Assigned Tasks</h2>
          </div>

          <div className="space-y-4">
            {assignedTasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-medium mb-2">No tasks available</h4>
                  <p className="text-sm text-muted-foreground">
                    No tasks have been created yet. Contact your administrator
                    to create tasks.
                  </p>
                </CardContent>
              </Card>
            ) : (
              assignedTasks.map((task) => (
                <Card
                  key={task.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {task.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {task.project} • {task.trade}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority} priority
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace("-", " ")}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            <TaskMediaUpload
                              taskId={task.id}
                              taskName={task.name}
                              size="sm"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateProgress(task.id)}
                            >
                              Update Progress
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleViewTaskDetails(task.id)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>

                        {/* Media Preview */}
                        {task.media && task.media.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-medium mb-2">
                              Uploaded Media ({task.media.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {task.media.slice(0, 4).map((media) => (
                                <div
                                  key={media.id}
                                  className="relative aspect-square bg-muted rounded-lg overflow-hidden"
                                >
                                  {media.type === "image" ? (
                                    <img
                                      src={media.url}
                                      alt={media.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <FileImage className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="h-6 w-6 p-0"
                                      onClick={() =>
                                        handleDeleteMedia(media.id)
                                      }
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {task.media.length > 4 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                +{task.media.length - 4} more files
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                Recent Uploads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUploads.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No media uploads yet
                  </div>
                ) : (
                  recentUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{upload.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {upload.taskName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(upload.uploadedAt).toLocaleDateString()}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMedia(upload.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Update Progress Dialog */}
        <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Update Progress</DialogTitle>
              <DialogDescription>
                Update the completion percentage for{" "}
                {selectedTask ? `the selected task` : "a task"}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {!selectedTask && (
                <div className="space-y-2">
                  <Label>Select Task</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedTask || ""}
                    onChange={(e) => {
                      setSelectedTask(e.target.value || null);
                      const task = assignedTasks.find(
                        (t) => t.id === e.target.value,
                      );
                      if (task) {
                        setProgressValue([task.progress]);
                      }
                    }}
                  >
                    <option value="">Select a task...</option>
                    {assignedTasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.name} - {task.progress}%
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Progress: {progressValue[0]}%</Label>
                <Slider
                  value={progressValue}
                  onValueChange={setProgressValue}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add notes about the progress update..."
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowProgressDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitProgress}>Update Progress</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
