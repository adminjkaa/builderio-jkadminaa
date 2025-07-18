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
  Milestone,
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
import ProgressComments from "@/components/ProgressComments";
import ProjectMediaGallery from "@/components/ProjectMediaGallery";

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const { projects, tasks } = useData();
  const navigate = useNavigate();
  const [showProjectGallery, setShowProjectGallery] = useState(false);
  const [selectedProjectForGallery, setSelectedProjectForGallery] =
    useState<string>("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleOpenProjectGallery = (projectName: string) => {
    setSelectedProjectForGallery(projectName);
    setShowProjectGallery(true);
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

    return {
      ...project,
      totalTasks: projectTasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      delayedTasks: delayedTasks.length,
      overallProgress,
      phases: phaseProgress,
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
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "planned":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "delayed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shadow-lg">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Client Portal
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Project Overview */}
        {projectStats.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <Calendar className="w-16 h-16 mx-auto text-gray-400" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Projects Available
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
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
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {project.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
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
                    <Link to="/timeline">
                      <Button variant="outline" className="gap-2">
                        <BarChart3 className="w-4 h-4" />
                        View Timeline
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenProjectGallery(project.name)}
                      className="gap-2"
                    >
                      <FileImage className="w-4 h-4" />
                      Project Gallery
                    </Button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Overall Progress
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {project.overallProgress}%
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Completed
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {project.completedTasks}/{project.totalTasks}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          In Progress
                        </p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {project.inProgressTasks}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Delayed
                        </p>
                        <p className="text-2xl font-bold text-red-900">
                          {project.delayedTasks}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Project Progress
                    </h4>
                    <span className="text-sm font-medium text-gray-700">
                      {project.overallProgress}%
                    </span>
                  </div>
                  <Progress value={project.overallProgress} className="h-3" />
                </div>
              </div>

              {/* Project Phases */}
              {project.phases && project.phases.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-gray-900">
                      Project Phases
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.phases.map((phase) => (
                      <div
                        key={phase.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: phase.color }}
                            />
                            <h5 className="font-semibold text-gray-900">
                              {phase.name}
                            </h5>
                            <Badge className={getStatusColor(phase.status)}>
                              {phase.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-700">
                              {phase.progress}%
                            </span>
                            <p className="text-xs text-gray-500">
                              {phase.taskCount} tasks
                            </p>
                          </div>
                        </div>
                        <Progress value={phase.progress} className="h-2" />
                        {phase.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {phase.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          ))
        )}

        {/* Bottom Section - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Milestones */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
                <Milestone className="w-5 h-5 text-blue-600" />
                Upcoming Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingMilestones.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No upcoming milestones
                  </p>
                ) : (
                  upcomingMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {milestone.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {milestone.project}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
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
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
                <Clock className="w-5 h-5 text-green-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {activity.project}
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">
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

        {/* Progress Comments */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-gray-900">
              Latest Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressComments projectName={projectStats[0]?.name} />
          </CardContent>
        </Card>

        {/* Project Media Gallery Dialog */}
        <ProjectMediaGallery
          projectName={selectedProjectForGallery}
          open={showProjectGallery}
          onClose={() => {
            setShowProjectGallery(false);
            setSelectedProjectForGallery("");
          }}
        />
      </div>
    </div>
  );
}
