import React, { useState } from "react";
import {
  MessageSquare,
  Calendar,
  TrendingUp,
  Filter,
  FileImage,
  Video,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useData, type Task, type ProgressComment } from "@/lib/data-context";

interface ProgressCommentsProps {
  projectName?: string;
}

export const ProgressComments: React.FC<ProgressCommentsProps> = ({
  projectName,
}) => {
  const { tasks, media } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "task">("date");

  // Filter tasks based on project if specified
  const availableTasks = projectName
    ? tasks.filter((task) => task.project === projectName)
    : tasks;

  // Get all progress comments with task info
  const allComments = availableTasks.flatMap((task) =>
    task.progressComments.map((comment) => ({
      ...comment,
      taskName: task.name,
      taskTrade: task.trade,
      taskStatus: task.status,
    })),
  );

  // Filter comments by search term
  const filteredComments = allComments.filter(
    (comment) =>
      comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.taskTrade.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sort comments
  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      // Sort by task name, then by date
      const taskCompare = a.taskName.localeCompare(b.taskName);
      if (taskCompare !== 0) return taskCompare;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  // Group comments by task when sorting by task
  const groupedComments =
    sortBy === "task"
      ? sortedComments.reduce(
          (groups, comment) => {
            const taskName = comment.taskName;
            if (!groups[taskName]) {
              groups[taskName] = [];
            }
            groups[taskName].push(comment);
            return groups;
          },
          {} as Record<string, typeof sortedComments>,
        )
      : null;

  // Get media for a specific task
  const getTaskMedia = (taskId: string) => {
    return media.filter((m) => m.taskId === taskId);
  };

  const getProgressColor = (previous: number, current: number) => {
    if (current > previous) return "text-success";
    if (current < previous) return "text-destructive";
    return "text-muted-foreground";
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

  const handleDownload = (mediaFile: any) => {
    const link = document.createElement("a");
    link.href = mediaFile.url;
    link.download = mediaFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderComment = (comment: any, showTaskInfo = true) => (
    <Card key={comment.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {showTaskInfo && (
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-medium">{comment.taskName}</h4>
                <Badge className={getStatusColor(comment.taskStatus)}>
                  {comment.taskStatus}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {comment.taskTrade}
                </Badge>
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span className="font-medium">{comment.userName}</span>
              <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
              <span>{new Date(comment.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-lg font-bold ${getProgressColor(comment.previousProgress, comment.newProgress)}`}
            >
              {comment.previousProgress}% → {comment.newProgress}%
            </div>
            <div className="text-xs text-muted-foreground">
              {comment.newProgress > comment.previousProgress
                ? `+${comment.newProgress - comment.previousProgress}%`
                : comment.newProgress < comment.previousProgress
                  ? `${comment.newProgress - comment.previousProgress}%`
                  : "No change"}
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 mb-3">
          <p className="text-sm">{comment.comment}</p>
        </div>

        {/* Task Media */}
        {(() => {
          const taskMedia = getTaskMedia(comment.taskId);
          if (taskMedia.length > 0) {
            return (
              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-3">
                  <FileImage className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Task Media ({taskMedia.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {taskMedia.slice(0, 4).map((mediaFile) => (
                    <div
                      key={mediaFile.id}
                      className="relative group bg-muted/30 rounded-lg overflow-hidden border aspect-video"
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
                                  <svg class="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Video className="w-6 h-6 text-muted-foreground" />
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
                        className="absolute top-1 left-1 text-xs"
                      >
                        {mediaFile.type}
                      </Badge>
                    </div>
                  ))}
                  {taskMedia.length > 4 && (
                    <div className="aspect-video rounded-lg border bg-muted flex items-center justify-center text-sm text-muted-foreground">
                      +{taskMedia.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })()}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Progress Comments & Media</h3>
          <p className="text-sm text-muted-foreground">
            Team member updates and media organized by{" "}
            {sortBy === "date" ? "date" : "task"}
            {projectName && ` for ${projectName}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search comments, tasks, or team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "task")}
          >
            <option value="date">Sort by Date</option>
            <option value="task">Group by Task</option>
          </select>
        </div>
      </div>

      {/* Comments Content */}
      {sortedComments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {allComments.length === 0
                ? "No Progress Comments"
                : "No Results Found"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {allComments.length === 0
                ? "Team members haven't added any progress comments yet. Progress updates will appear here as work is completed."
                : "Try adjusting your search terms or filters to find the comments you're looking for."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {sortBy === "date" ? (
            <div className="space-y-4">
              {sortedComments.map((comment) => renderComment(comment, true))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedComments!).map(([taskName, comments]) => (
                <div key={taskName}>
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h4 className="text-lg font-semibold">{taskName}</h4>
                    <Badge variant="outline">{comments.length} updates</Badge>
                  </div>
                  <div className="space-y-4 ml-6">
                    {comments.map((comment) => renderComment(comment, false))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressComments;
