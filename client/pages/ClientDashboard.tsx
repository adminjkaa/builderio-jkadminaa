import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Eye,
  BarChart3,
  LogOut,
  CheckCircle,
  AlertTriangle,
  FileImage,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-context";
import MediaGalleryModal from "@/components/MediaGalleryModal";

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const { projects, tasks, media } = useData();
  const navigate = useNavigate();
  const [showGallery, setShowGallery] = useState(false);
  const [selectedProjectMedia, setSelectedProjectMedia] = useState<any[]>([]);
  const [selectedProjectName, setSelectedProjectName] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const openGallery = (project: any) => {
    setSelectedProjectMedia(project.media);
    setSelectedProjectName(project.name);
    setShowGallery(true);
  };

  // Calculate comprehensive project statistics
  const projectStats = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.project === project.name);
    const completedTasks = projectTasks.filter(
      (task) => task.status === "completed",
    );
    const inProgressTasks = projectTasks.filter(
      (task) => task.status === "in-progress",
    );
    const delayedTasks = projectTasks.filter(
      (task) => task.status === "delayed",
    );

    const overallProgress =
      projectTasks.length > 0
        ? Math.round(
            projectTasks.reduce((sum, task) => sum + task.progress, 0) /
              projectTasks.length,
          )
        : 0;

    // Calculate phase progress
    const phaseProgress = project.phases.map((phase) => {
      const phaseTasks = projectTasks.filter(
        (task) => task.phaseId === phase.id,
      );
      const phaseTaskProgress =
        phaseTasks.length > 0
          ? Math.round(
              phaseTasks.reduce((sum, task) => sum + task.progress, 0) /
                phaseTasks.length,
            )
          : 0;

      return {
        ...phase,
        progress: phaseTaskProgress,
        status:
          phaseTaskProgress === 100
            ? "completed"
            : phaseTaskProgress > 0
              ? "in-progress"
              : "planned",
        taskCount: phaseTasks.length,
      };
    });

    // Get project media
    const projectMedia = media.filter((mediaFile) => {
      const task = projectTasks.find((t) => t.id === mediaFile.taskId);
      return task !== undefined;
    });

    return {
      ...project,
      totalTasks: projectTasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      delayedTasks: delayedTasks.length,
      overallProgress,
      phases: phaseProgress,
      media: projectMedia,
    };
  });

  // Generate upcoming milestones
  const upcomingMilestones = tasks
    .filter((task) => task.dueDate && new Date(task.dueDate) > new Date())
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 4)
    .map((task) => ({
      id: task.id,
      name: task.name,
      type: "deadline" as const,
      date: task.dueDate,
      status: "pending" as const,
      project: task.project,
      priority: task.priority,
    }));

  // Generate recent activity
  const recentActivity = tasks
    .filter((task) => task.progress > 0)
    .slice(0, 4)
    .map((task) => ({
      id: task.id,
      title: `${task.name}`,
      description: `Progress: ${task.progress}% complete`,
      date: new Date().toISOString().split("T")[0],
      type: task.status,
      project: task.project,
    }));

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
              <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-lg">
                <Eye className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Client Dashboard</h1>
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

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Project Overview */}
        {projectStats.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  No Projects Available
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You don't have access to any projects yet. Contact your
                  administrator to be assigned to a project.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          projectStats.map((project) => (
            <div key={project.id} className="space-y-6">
              {/* Project Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">
                        {project.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(
                            project.startDate,
                          ).toLocaleDateString()} -{" "}
                          {new Date(project.endDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {project.members} team members
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link to={`/timeline/${project.id}`}>
                        <Button variant="outline" className="gap-2">
                          <BarChart3 className="w-4 h-4" />
                          View Timeline
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => openGallery(project)}
                      >
                        <FileImage className="w-4 h-4" />
                        Gallery ({project.media.length})
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Overall Progress
                            </p>
                            <p className="text-2xl font-bold">
                              {project.overallProgress}%
                            </p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-info" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Completed
                            </p>
                            <p className="text-2xl font-bold">
                              {project.completedTasks}/{project.totalTasks}
                            </p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              In Progress
                            </p>
                            <p className="text-2xl font-bold">
                              {project.inProgressTasks}
                            </p>
                          </div>
                          <Clock className="w-8 h-8 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Delayed
                            </p>
                            <p className="text-2xl font-bold">
                              {project.delayedTasks}
                            </p>
                          </div>
                          <AlertTriangle className="w-8 h-8 text-destructive" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">
                        Project Progress
                      </h4>
                      <span className="text-sm font-medium">
                        {project.overallProgress}%
                      </span>
                    </div>
                    <Progress value={project.overallProgress} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Project Phases */}
              {project.phases && project.phases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Phases</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.phases.map((phase) => (
                      <div
                        key={phase.id}
                        className="bg-muted/50 rounded-lg p-4 border"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: phase.color }}
                            />
                            <h5 className="font-semibold">{phase.name}</h5>
                            <Badge className={getStatusColor(phase.status)}>
                              {phase.status.replace("-", " ")}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">
                              {phase.progress}%
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {phase.taskCount} tasks
                            </p>
                          </div>
                        </div>
                        <Progress value={phase.progress} className="h-2" />
                        {phase.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {phase.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Project Media Gallery */}
              {project.media && project.media.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileImage className="w-5 h-5" />
                        Project Media ({project.media.length})
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openGallery(project)}
                      >
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {project.media.slice(0, 12).map((mediaFile) => (
                        <div
                          key={mediaFile.id}
                          className="group relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => openGallery(project)}
                        >
                          {mediaFile.type === "image" ? (
                            <img
                              src={mediaFile.url}
                              alt={mediaFile.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <FileImage className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="text-white text-xs font-medium">
                              View
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {project.media.length > 12 && (
                      <div className="mt-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openGallery(project)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          +{project.media.length - 12} more files - Click to
                          view all
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ))
        )}

        {/* Bottom Section - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingMilestones.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No upcoming milestones
                  </p>
                ) : (
                  upcomingMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-info/20 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-info" />
                        </div>
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {milestone.project}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(milestone.date).toLocaleDateString()}
                        </p>
                        <Badge
                          className={getPriorityColor(milestone.priority)}
                          variant="outline"
                        >
                          {milestone.priority}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors"
                    >
                      <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {activity.project}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Media Gallery Modal */}
        <MediaGalleryModal
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          projectName={selectedProjectName}
          projectMedia={selectedProjectMedia}
        />
      </div>
    </div>
  );
}
