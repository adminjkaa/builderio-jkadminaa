import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Filter,
  Search,
  LogOut,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-context";

export default function ProjectTimeline() {
  const { projectId } = useParams();
  const { user, logout } = useAuth();
  const { projects, tasks } = useData();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBack = () => {
    navigate(`/dashboard/${user?.role}`);
  };

  // Get current project (first project if no projectId specified)
  const currentProject = projectId
    ? projects.find((p) => p.id === projectId)
    : projects[0];

  // Get project tasks
  const projectTasks = currentProject
    ? tasks.filter((task) => task.project === currentProject.name)
    : [];

  // Filter tasks based on search and status
  const filteredTasks = projectTasks.filter((task) => {
    const matchesSearch = task.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Group tasks by phases
  const tasksByPhase = currentProject?.phases
    ? currentProject.phases
        .sort((a, b) => a.order - b.order)
        .map((phase) => ({
          ...phase,
          tasks: filteredTasks.filter((task) => task.phaseId === phase.id),
        }))
    : [];

  // Tasks not assigned to any phase
  const unassignedTasks = filteredTasks.filter((task) => !task.phaseId);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in-progress":
        return <Clock className="w-4 h-4" />;
      case "delayed":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Project Timeline</h1>
                <p className="text-sm text-muted-foreground">
                  {currentProject?.name || "Select a project"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {!currentProject ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Project Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                No projects are available or the specified project was not
                found. Please create a project first.
              </p>
              <Button onClick={handleBack}>Go Back</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Project Overview */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {currentProject.name}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">
                      {new Date(currentProject.startDate).toLocaleDateString()}{" "}
                      - {new Date(currentProject.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Overall Progress
                    </p>
                    <p className="text-2xl font-bold">
                      {currentProject.progress}%
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={currentProject.progress} className="h-3" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                    <p className="text-xl font-bold">{projectTasks.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold text-success">
                      {
                        projectTasks.filter((t) => t.status === "completed")
                          .length
                      }
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-xl font-bold text-info">
                      {
                        projectTasks.filter((t) => t.status === "in-progress")
                          .length
                      }
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Delayed</p>
                    <p className="text-xl font-bold text-destructive">
                      {
                        projectTasks.filter((t) => t.status === "delayed")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline by Phases */}
            <div className="space-y-6">
              {tasksByPhase.map((phase) => (
                <Card key={phase.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: phase.color }}
                      />
                      <CardTitle>{phase.name}</CardTitle>
                      <Badge variant="outline">
                        {phase.tasks.length} tasks
                      </Badge>
                    </div>
                    {phase.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {phase.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span>
                        {new Date(phase.startDate).toLocaleDateString()} -{" "}
                        {new Date(phase.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {phase.tasks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No tasks in this phase
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {phase.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(task.status)}
                                <h4 className="font-medium">{task.name}</h4>
                                <Badge className={getStatusColor(task.status)}>
                                  {task.status.replace("-", " ")}
                                </Badge>
                                <Badge
                                  className={getPriorityColor(task.priority)}
                                  variant="outline"
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Trade: {task.trade}</span>
                                <span>
                                  Due:{" "}
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                                <span>{task.media.length} media files</span>
                              </div>
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span>{task.progress}%</span>
                                </div>
                                <Progress
                                  value={task.progress}
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Unassigned Tasks */}
              {unassignedTasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Unassigned Tasks</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Tasks not assigned to any specific phase
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {unassignedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(task.status)}
                              <h4 className="font-medium">{task.name}</h4>
                              <Badge className={getStatusColor(task.status)}>
                                {task.status.replace("-", " ")}
                              </Badge>
                              <Badge
                                className={getPriorityColor(task.priority)}
                                variant="outline"
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Trade: {task.trade}</span>
                              <span>
                                Due:{" "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                              <span>{task.media.length} media files</span>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
