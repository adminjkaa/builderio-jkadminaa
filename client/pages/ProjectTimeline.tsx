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

    // Generate timeline days
    const timelineDays = [];
    const currentDate = new Date(projectStart);

    for (let i = 0; i <= totalDays; i++) {
      timelineDays.push({
        date: new Date(currentDate),
        dayNumber: i + 1,
        weekNumber: Math.ceil((i + 1) / 7),
        isWeekStart: i % 7 === 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

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
      timelineDays,
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
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "planned":
        return "bg-gray-400";
      case "delayed":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getPhaseColor = (phase: any) => {
    return phase?.color || "#8B5CF6";
  };

  const GanttChart = () => {
    if (!timelineData) return null;

    const { timelineDays, tasksByPhase, unassignedTasks } = timelineData;
    const dayWidth = 100 / timelineData.totalDays;

    return (
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {/* Gantt Chart Header */}
        <div className="bg-gray-50 border-b">
          <div className="flex">
            {/* Left column header */}
            <div className="w-80 border-r bg-gray-100 p-4">
              <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-gray-600 uppercase">
                <div>TASK</div>
                <div>ASSIGNED TO</div>
                <div>PROGRESS</div>
                <div>DATES</div>
              </div>
            </div>

            {/* Timeline header */}
            <div className="flex-1 relative">
              {/* Week headers */}
              <div className="flex border-b bg-gray-200">
                {Array.from(
                  { length: Math.ceil(timelineData.totalDays / 7) },
                  (_, weekIndex) => (
                    <div
                      key={weekIndex}
                      className="border-r border-gray-300 text-center py-2 text-xs font-semibold"
                      style={{ width: `${dayWidth * 7}%` }}
                    >
                      Week {weekIndex + 1}
                    </div>
                  ),
                )}
              </div>

              {/* Day headers */}
              <div className="flex">
                {timelineDays.map((day, index) => (
                  <div
                    key={index}
                    className={`border-r border-gray-200 text-center py-2 text-xs ${
                      day.isWeekStart ? "bg-gray-100 font-semibold" : "bg-white"
                    }`}
                    style={{ width: `${dayWidth}%` }}
                  >
                    <div>{day.date.getDate()}</div>
                    <div className="text-gray-500">
                      {day.date.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gantt Chart Body */}
        <div className="max-h-96 overflow-y-auto">
          {/* Phase sections */}
          {tasksByPhase.map((phase) => (
            <div key={phase.id} className="border-b">
              {/* Phase header */}
              <div className="bg-gray-50 px-4 py-2 border-b">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: phase.color }}
                  />
                  <span className="font-semibold text-gray-700">
                    {phase.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {phase.tasks.length} tasks
                  </Badge>
                </div>
              </div>

              {/* Phase tasks */}
              {phase.tasks.map((task, taskIndex) => {
                const { left, width } = getTaskPosition(
                  task.startDate,
                  task.endDate,
                );
                const phaseColorHex = getPhaseColor(phase);

                return (
                  <div
                    key={task.id}
                    className="flex border-b border-gray-100 hover:bg-gray-50"
                  >
                    {/* Task info column */}
                    <div className="w-80 border-r p-3">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">
                            {task.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.trade}
                          </div>
                        </div>
                        <div className="text-gray-600">
                          {task.assignedTo || "Unassigned"}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {task.progress}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          <div>
                            {new Date(task.startDate).toLocaleDateString()}
                          </div>
                          <div>
                            {new Date(task.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline bars */}
                    <div className="flex-1 relative py-4">
                      <div className="relative h-6">
                        {/* Background bar */}
                        <div
                          className="absolute top-1 h-4 rounded opacity-30"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: phaseColorHex,
                          }}
                        />

                        {/* Progress bar */}
                        <div
                          className="absolute top-1 h-4 rounded"
                          style={{
                            left: `${left}%`,
                            width: `${(width * task.progress) / 100}%`,
                            backgroundColor: phaseColorHex,
                          }}
                        />

                        {/* Progress text overlay */}
                        <div
                          className="absolute top-1 h-4 flex items-center justify-center text-xs font-medium text-white"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                          }}
                        >
                          {task.progress}%
                        </div>
                      </div>

                      {/* Day grid lines */}
                      <div className="absolute inset-0 flex">
                        {timelineDays.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className="border-r border-gray-100"
                            style={{ width: `${dayWidth}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Unassigned tasks */}
          {unassignedTasks.length > 0 && (
            <div className="border-b">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <span className="font-semibold text-gray-700">
                  Unassigned Tasks
                </span>
              </div>
              {unassignedTasks.map((task) => {
                const { left, width } = getTaskPosition(
                  task.startDate,
                  task.endDate,
                );

                return (
                  <div
                    key={task.id}
                    className="flex border-b border-gray-100 hover:bg-gray-50"
                  >
                    <div className="w-80 border-r p-3">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">
                            {task.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.trade}
                          </div>
                        </div>
                        <div className="text-gray-600">
                          {task.assignedTo || "Unassigned"}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {task.progress}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          <div>
                            {new Date(task.startDate).toLocaleDateString()}
                          </div>
                          <div>
                            {new Date(task.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 relative py-4">
                      <div className="relative h-6">
                        <div
                          className="absolute top-1 h-4 bg-gray-400 rounded opacity-30"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                          }}
                        />
                        <div
                          className="absolute top-1 h-4 bg-gray-600 rounded"
                          style={{
                            left: `${left}%`,
                            width: `${(width * task.progress) / 100}%`,
                          }}
                        />
                        <div
                          className="absolute top-1 h-4 flex items-center justify-center text-xs font-medium text-white"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                          }}
                        >
                          {task.progress}%
                        </div>
                      </div>

                      <div className="absolute inset-0 flex">
                        {timelineDays.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className="border-r border-gray-100"
                            style={{ width: `${dayWidth}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>
                        Project Start Date:{" "}
                        {new Date(
                          currentProject.startDate,
                        ).toLocaleDateString()}
                      </span>
                      <span>
                        Current Week:{" "}
                        {Math.ceil(
                          (new Date().getTime() -
                            new Date(currentProject.startDate).getTime()) /
                            (7 * 24 * 60 * 60 * 1000),
                        )}
                      </span>
                    </div>
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

            {/* Gantt Chart */}
            <GanttChart />
          </>
        )}
      </div>
    </div>
  );
}
