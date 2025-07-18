import React, { useState } from "react";
import { MessageSquare, TrendingUp, Clock, CheckCircle } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useData, type Task } from "@/lib/data-context";
import { useAuth } from "@/lib/auth";

interface ProgressUpdateProps {
  projectName?: string;
}

export const ProgressUpdate: React.FC<ProgressUpdateProps> = ({
  projectName,
}) => {
  const { tasks, updateTaskProgress } = useData();
  const { user } = useAuth();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newProgress, setNewProgress] = useState(0);
  const [comment, setComment] = useState("");

  // Filter tasks based on project if specified
  const availableTasks = projectName
    ? tasks.filter((task) => task.project === projectName)
    : tasks;

  const handleUpdateProgress = (task: Task) => {
    setSelectedTask(task);
    setNewProgress(task.progress);
    setComment("");
    setShowUpdateDialog(true);
  };

  const handleSubmitUpdate = () => {
    if (selectedTask && user && comment.trim()) {
      updateTaskProgress(
        selectedTask.id,
        newProgress,
        comment.trim(),
        user.id,
        user.name,
      );
      setShowUpdateDialog(false);
      setSelectedTask(null);
      setNewProgress(0);
      setComment("");
    }
  };

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

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "text-success";
    if (progress >= 50) return "text-info";
    if (progress > 0) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Task Progress Updates</h3>
          <p className="text-sm text-muted-foreground">
            Update progress and add comments for tasks
            {projectName && ` in ${projectName}`}
          </p>
        </div>
      </div>

      {availableTasks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Tasks Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {projectName
                ? `No tasks found for project "${projectName}".`
                : "No tasks have been created yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {availableTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{task.name}</h4>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Trade: {task.trade}</span>
                      <span>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span>Priority: {task.priority}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${getProgressColor(task.progress)}`}
                    >
                      {task.progress}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {/* Latest Progress Comment */}
                {task.progressComments.length > 0 && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span>
                            {
                              task.progressComments[
                                task.progressComments.length - 1
                              ].userName
                            }
                          </span>
                          <span>
                            {new Date(
                              task.progressComments[
                                task.progressComments.length - 1
                              ].timestamp,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">
                          {
                            task.progressComments[
                              task.progressComments.length - 1
                            ].comment
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Comments Summary */}
                {task.progressComments.length > 1 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground">
                      {task.progressComments.length} progress updates
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {task.progressComments.length > 0 && (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>
                          Last updated:{" "}
                          {new Date(
                            task.progressComments[
                              task.progressComments.length - 1
                            ].timestamp,
                          ).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={() => handleUpdateProgress(task)}
                    disabled={task.status === "completed"}
                  >
                    {task.status === "completed" ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Update Progress
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Progress Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Task Progress</DialogTitle>
            <DialogDescription>
              Update progress for "{selectedTask?.name}" and add a comment about
              the work completed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="progress">Progress Percentage</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{
                      width: `${Math.min(Math.max(newProgress, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
              {selectedTask && (
                <p className="text-xs text-muted-foreground">
                  Current progress: {selectedTask.progress}%
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Progress Comment *</Label>
              <Textarea
                id="comment"
                placeholder="Describe what work was completed, any challenges encountered, or next steps..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This comment will be visible to all team members and clients.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowUpdateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitUpdate}
              disabled={!comment.trim() || newProgress < 0 || newProgress > 100}
            >
              Update Progress
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgressUpdate;
