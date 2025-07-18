import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  Camera,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: "planned" | "in-progress" | "delayed" | "completed";
  trade: string;
  assignedTo?: string;
  dependencies?: string[];
  milestones: {
    id: string;
    name: string;
    type: "inspection" | "approval" | "handover";
    date: Date;
    completed: boolean;
  }[];
  mediaCount: number;
  media?: {
    id: string;
    name: string;
    url: string;
    type: "image" | "video";
    uploadedBy: string;
    uploadedAt: string;
  }[];
}

interface GanttPhase {
  id: string;
  name: string;
  color: string;
  tasks: GanttTask[];
  collapsed: boolean;
}

interface GanttChartProps {
  phases: GanttPhase[];
  startDate: Date;
  endDate: Date;
  userRole: "admin" | "member" | "client";
  onTaskClick?: (task: GanttTask) => void;
  onPhaseToggle?: (phaseId: string) => void;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  phases,
  startDate,
  endDate,
  userRole,
  onTaskClick,
  onPhaseToggle,
  scrollRef,
}) => {
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  // Calculate time span and grid
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const dayWidth = 40; // pixels per day
  const chartWidth = totalDays * dayWidth;

  // Generate date grid
  const dateGrid = [];
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dateGrid.push(date);
  }

  const getTaskPosition = (task: GanttTask) => {
    const taskStart = Math.max(
      0,
      Math.floor(
        (task.startDate.getTime() - startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    const taskEnd = Math.min(
      totalDays,
      Math.ceil(
        (task.endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const duration = taskEnd - taskStart;

    return {
      left: taskStart * dayWidth,
      width: Math.max(duration * dayWidth, dayWidth),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "in-progress":
        return "bg-info";
      case "delayed":
        return "bg-destructive";
      case "planned":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "inspection":
        return <Eye className="w-3 h-3" />;
      case "approval":
        return <CheckCircle className="w-3 h-3" />;
      case "handover":
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  return (
    <div className="border rounded-lg bg-card">
      {/* Header with date grid */}
      <div className="border-b bg-muted/30">
        <div className="flex">
          {/* Task name column header */}
          <div className="w-80 p-4 border-r bg-background">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tasks</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {totalDays} days
              </div>
            </div>
          </div>

          {/* Date header */}
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="flex" style={{ width: chartWidth }}>
              {dateGrid.map((date, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 border-r p-2 text-center"
                  style={{ width: dayWidth }}
                >
                  <div className="text-xs font-medium">
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Chart body */}
      <ScrollArea className="max-h-96">
        <div className="relative">
          {phases.map((phase) => (
            <div key={phase.id} className="border-b last:border-b-0">
              {/* Phase header */}
              <div className="flex">
                <div className="w-80 p-3 border-r bg-muted/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start p-0 h-auto"
                    onClick={() => onPhaseToggle?.(phase.id)}
                  >
                    {phase.collapsed ? (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    )}
                    <div
                      className="w-3 h-3 rounded mr-2"
                      style={{ backgroundColor: phase.color }}
                    />
                    <span className="font-medium">{phase.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {phase.tasks.length}
                    </Badge>
                  </Button>
                </div>
                <div
                  className="flex-1 relative"
                  style={{ width: chartWidth, minHeight: "48px" }}
                >
                  {/* Phase timeline bar */}
                  <div
                    className="absolute top-4 h-2 rounded opacity-20"
                    style={{
                      backgroundColor: phase.color,
                      left: 0,
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              {/* Phase tasks */}
              {!phase.collapsed &&
                phase.tasks.map((task) => {
                  const position = getTaskPosition(task);
                  return (
                    <div key={task.id} className="flex">
                      {/* Task info */}
                      <div className="w-80 p-3 border-r">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {task.name}
                            </span>
                            <Badge
                              className={cn(
                                "text-xs",
                                getStatusColor(task.status),
                              )}
                            >
                              {task.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{task.trade}</span>
                            {task.assignedTo && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{task.assignedTo}</span>
                              </div>
                            )}
                            {task.mediaCount > 0 && (
                              <div className="flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                <span>{task.mediaCount}</span>
                              </div>
                            )}
                          </div>
                          {/* Media thumbnails */}
                          {task.media && task.media.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {task.media.slice(0, 3).map((mediaFile) => (
                                <div
                                  key={mediaFile.id}
                                  className="w-8 h-8 rounded border overflow-hidden bg-muted flex-shrink-0"
                                  title={`${mediaFile.name} by ${mediaFile.uploadedBy}`}
                                >
                                  {mediaFile.type === "image" ? (
                                    <img
                                      src={mediaFile.url}
                                      alt={mediaFile.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = `
                                            <div class="w-full h-full flex items-center justify-center bg-muted">
                                              <svg class="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                              </svg>
                                            </div>
                                          `;
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                      <svg
                                        className="w-4 h-4 text-muted-foreground"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8a1 1 0 00.553.894l2 1A1 1 0 0018 9V7a1 1 0 00-1.447-.894l-2 1z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {task.media.length > 3 && (
                                <div className="w-8 h-8 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                  +{task.media.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Task timeline */}
                      <div
                        className="flex-1 relative p-2"
                        style={{ width: chartWidth, minHeight: "60px" }}
                      >
                        {/* Task bar */}
                        <div
                          className={cn(
                            "absolute top-3 h-6 rounded cursor-pointer transition-all duration-200 border",
                            getStatusColor(task.status),
                            hoveredTask === task.id
                              ? "shadow-lg scale-105"
                              : "shadow-sm",
                          )}
                          style={position}
                          onMouseEnter={() => setHoveredTask(task.id)}
                          onMouseLeave={() => setHoveredTask(null)}
                          onClick={() => onTaskClick?.(task)}
                        >
                          {/* Progress bar */}
                          <div
                            className="h-full bg-primary/80 rounded transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />

                          {/* Task name overlay */}
                          <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-xs font-medium text-white truncate">
                              {task.progress}%
                            </span>
                          </div>
                        </div>

                        {/* Milestones */}
                        {task.milestones.map((milestone) => {
                          const milestonePos = Math.floor(
                            (milestone.date.getTime() - startDate.getTime()) /
                              (1000 * 60 * 60 * 24),
                          );
                          return (
                            <div
                              key={milestone.id}
                              className={cn(
                                "absolute top-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center transition-all duration-200",
                                milestone.completed
                                  ? "bg-success"
                                  : "bg-warning",
                                hoveredTask === task.id ? "scale-125" : "",
                              )}
                              style={{
                                left: milestonePos * dayWidth - 8,
                              }}
                              title={`${milestone.name} - ${milestone.date.toLocaleDateString()}`}
                            >
                              {getMilestoneIcon(milestone.type)}
                            </div>
                          );
                        })}

                        {/* Hover tooltip */}
                        {hoveredTask === task.id && (
                          <div className="absolute top-12 left-4 z-10">
                            <Card className="shadow-lg">
                              <CardContent className="p-3 space-y-2">
                                <div>
                                  <p className="font-medium">{task.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {task.trade}
                                  </p>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div>
                                    Start: {task.startDate.toLocaleDateString()}
                                  </div>
                                  <div>
                                    End: {task.endDate.toLocaleDateString()}
                                  </div>
                                  <div>Progress: {task.progress}%</div>
                                  {task.assignedTo && (
                                    <div>Assigned to: {task.assignedTo}</div>
                                  )}
                                </div>
                                {userRole !== "client" && (
                                  <div className="pt-2 border-t">
                                    <Button size="sm" className="w-full">
                                      {userRole === "admin"
                                        ? "Edit Task"
                                        : "Update Progress"}
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GanttChart;
