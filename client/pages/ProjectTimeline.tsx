import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  ArrowLeft,
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
  const [viewMode, setViewMode] = useState<"gantt" | "list">("gantt");

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

  // Calculate timeline dimensions and dates
  const timelineData = useMemo(() => {
    if (!currentProject || filteredTasks.length === 0) return null;

    const projectStart = new Date(currentProject.startDate);
    const projectEnd = new Date(currentProject.endDate);
    const totalDays = Math.ceil(
      (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Group tasks by phases
    const tasksByPhase = currentProject.phases
      ? currentProject.phases
          .sort((a, b) => a.order - b.order)
          .map((phase) => ({
            ...phase,
            tasks: filteredTasks.filter((task) => task.phaseId === phase.id),
          }))
      : [];

    // Tasks not assigned to any phase
    const unassignedTasks = filteredTasks.filter((task) => !task.phaseId);

    return {
      projectStart,
      projectEnd,
      totalDays,
      tasksByPhase,
      unassignedTasks,
    };
  }, [currentProject, filteredTasks]);

  const getTaskPosition = (taskStartDate: string, taskEndDate: string) => {
    if (!timelineData) return { left: 0, width: 0 };

    const taskStart = new Date(taskStartDate);
    const taskEnd = new Date(taskEndDate);
    const { projectStart, totalDays } = timelineData;

    const daysFromStart = Math.max(
      0,
      Math.ceil(
        (taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const taskDuration = Math.max(
      1,
      Math.ceil(
        (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    const left = (daysFromStart / totalDays) * 100;
    const width = (taskDuration / totalDays) * 100;

    return { left, width };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "in-progress":
        return "bg-info";
      case "planned":
        return "bg-muted";
      case "delayed":
        return "bg-destructive";
      default:
        return "bg-muted";
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

  const generateTimelineHeader = () => {
    if (!timelineData) return [];

    const { projectStart, totalDays } = timelineData;
    const weeks = [];
    let currentDate = new Date(projectStart);

    for (let i = 0; i <= totalDays; i += 7) {
      weeks.push({
        week: `Week ${Math.floor(i / 7) + 1}`,
        date: new Date(currentDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        position: (i / totalDays) * 100,
      });
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeks;
  };

  const GanttChart = () => {
    if (!timelineData) return null;

    const timelineWeeks = generateTimelineHeader();

    return (
      <div className="space-y-6">
        {/* Timeline Header */}
        <div className="relative bg-muted/20 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-2">
            <span>Timeline ({timelineData.totalDays} days)</span>
            <span>
              {timelineData.projectStart.toLocaleDateString()} -{" "}
              {timelineData.projectEnd.toLocaleDateString()}
            </span>
          </div>
          <div className="relative h-8 bg-background rounded border">
            {timelineWeeks.map((week, index) => (
              <div
                key={index}
                className="absolute top-0 h-full flex flex-col justify-center text-xs text-muted-foreground border-r border-border"
                style={{ left: `${week.position}%` }}
              >
                <div className="px-2">
                  <div className="font-medium">{week.week}</div>
                  <div>{week.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gantt Chart Content */}
        <div className="space-y-6">
          {timelineData.tasksByPhase.map((phase) => (
            <Card key={phase.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: phase.color }}
                  />
                  <CardTitle className="text-lg">{phase.name}</CardTitle>
                  <Badge variant="outline">{phase.tasks.length} tasks</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {phase.tasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No tasks in this phase
                  </p>
                ) : (
                  phase.tasks.map((task) => {
                    const { left, width } = getTaskPosition(
                      task.startDate,
                      task.endDate,
                    );
                    return (
                      <div key={task.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            <span className="font-medium">{task.name}</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getStatusColor(
                                task.status,
                              )} text-white`}
                            >
                              {task.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>{task.progress}%</span>
                            <span className="text-xs">
                              {new Date(task.startDate).toLocaleDateString()} -{" "}
                              {new Date(task.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="relative h-6 bg-muted/30 rounded">
                          <div
                            className={`absolute top-0 h-full rounded ${getStatusColor(
                              task.status,
                            )} opacity-80`}
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                            }}
                          >
                            <div className="h-full flex items-center justify-center">
                              <div
                                className="h-2 bg-white/20 rounded-full"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                          <div
                            className="absolute top-0 h-full bg-white/10 rounded"
                            style={{
                              left: `${left}%`,
                              width: `${(width * task.progress) / 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          ))}

          {/* Unassigned Tasks */}
          {timelineData.unassignedTasks.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Unassigned Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {timelineData.unassignedTasks.map((task) => {
                  const { left, width } = getTaskPosition(
                    task.startDate,
                    task.endDate,
                  );
                  return (
                    <div key={task.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="font-medium">{task.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(
                              task.status,
                            )} text-white`}
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>{task.progress}%</span>
                          <span className="text-xs">
                            {new Date(task.startDate).toLocaleDateString()} -{" "}
                            {new Date(task.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-6 bg-muted/30 rounded">
                        <div
                          className={`absolute top-0 h-full rounded ${getStatusColor(
                            task.status,
                          )} opacity-80`}
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                          }}
                        >
                          <div className="h-full flex items-center justify-center">
                            <div
                              className="h-2 bg-white/20 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                        <div
                          className="absolute top-0 h-full bg-white/10 rounded"
                          style={{
                            left: `${left}%`,
                            width: `${(width * task.progress) / 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
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

            {/* Filters and View Toggle */}
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "gantt" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("gantt")}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Gantt View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gantt Chart */}
            {viewMode === "gantt" && <GanttChart />}
          </>
        )}
      </div>
    </div>
  );
}
