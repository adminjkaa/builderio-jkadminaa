import React, { useState } from "react";
import { Plus, Users, Calendar, Edit, Trash2 } from "lucide-react";
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
import { useData } from "@/lib/data-context";
import TaskMediaUpload from "./TaskMediaUpload";

export const TaskManagement: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, projects, users } = useData();
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [newTaskData, setNewTaskData] = useState({
    name: "",
    project: "",
    startDate: "",
    endDate: "",
    dueDate: "",
    trade: "",
    priority: "medium" as "high" | "medium" | "low",
    phaseId: "",
  });

  const [editTaskData, setEditTaskData] = useState({
    name: "",
    project: "",
    startDate: "",
    endDate: "",
    dueDate: "",
    trade: "",
    priority: "medium" as "high" | "medium" | "low",
    status: "planned" as "planned" | "in-progress" | "delayed" | "completed",
    progress: 0,
    phaseId: "",
  });

  const handleCreateTask = () => {
    if (
      newTaskData.name &&
      newTaskData.project &&
      (newTaskData.startDate || newTaskData.dueDate)
    ) {
      addTask({
        name: newTaskData.name,
        project: newTaskData.project,
        progress: 0,
        status: "planned",
        startDate: newTaskData.startDate || newTaskData.dueDate,
        endDate: newTaskData.endDate || newTaskData.dueDate,
        dueDate: newTaskData.dueDate || newTaskData.endDate,
        trade: newTaskData.trade || "General",
        priority: newTaskData.priority,
        phaseId: newTaskData.phaseId || undefined,
      });
      setShowCreateTaskDialog(false);
      setNewTaskData({
        name: "",
        project: "",
        startDate: "",
        endDate: "",
        dueDate: "",
        trade: "",
        priority: "medium",
        phaseId: "",
      });
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setEditTaskData({
      name: task.name,
      project: task.project,
      startDate: task.startDate || task.dueDate,
      endDate: task.endDate || task.dueDate,
      dueDate: task.dueDate,
      trade: task.trade,
      priority: task.priority,
      status: task.status,
      progress: task.progress,
      phaseId: task.phaseId || "",
    });
    setShowEditTaskDialog(true);
  };

  const handleUpdateTask = () => {
    if (
      editingTask &&
      editTaskData.name &&
      editTaskData.project &&
      (editTaskData.startDate || editTaskData.dueDate)
    ) {
      updateTask(editingTask.id, {
        name: editTaskData.name,
        project: editTaskData.project,
        startDate: editTaskData.startDate || editTaskData.dueDate,
        endDate: editTaskData.endDate || editTaskData.dueDate,
        dueDate: editTaskData.dueDate || editTaskData.endDate,
        trade: editTaskData.trade || "General",
        priority: editTaskData.priority,
        status: editTaskData.status,
        progress: editTaskData.progress,
        phaseId: editTaskData.phaseId || undefined,
      });
      setShowEditTaskDialog(false);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Task Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and assign tasks to team members
          </p>
        </div>
        <Button onClick={() => setShowCreateTaskDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-medium mb-2">No tasks created yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first task to get started with project management.
            </p>
            <Button onClick={() => setShowCreateTaskDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Tasks ({tasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{task.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Project: {task.project}</span>
                      <span>Trade: {task.trade}</span>
                      <span>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {task.progress}%
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {task.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TaskMediaUpload
                        taskId={task.id}
                        taskName={task.name}
                        variant="icon"
                        size="sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTask(task)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Task Dialog */}
      <Dialog
        open={showCreateTaskDialog}
        onOpenChange={setShowCreateTaskDialog}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task for the entire team to work on.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-name" className="text-right">
                Task Name
              </Label>
              <Input
                id="task-name"
                placeholder="Enter task name"
                className="col-span-3"
                value={newTaskData.name}
                onChange={(e) =>
                  setNewTaskData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-project" className="text-right">
                Project
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm col-span-3"
                value={newTaskData.project}
                onChange={(e) =>
                  setNewTaskData((prev) => ({
                    ...prev,
                    project: e.target.value,
                  }))
                }
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-phase" className="text-right">
                Phase
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm col-span-3"
                value={newTaskData.phaseId}
                onChange={(e) =>
                  setNewTaskData((prev) => ({
                    ...prev,
                    phaseId: e.target.value,
                  }))
                }
              >
                <option value="">No phase assigned</option>
                {newTaskData.project &&
                  projects
                    .find((p) => p.name === newTaskData.project)
                    ?.phases.sort((a, b) => a.order - b.order)
                    .map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.name}
                      </option>
                    ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-trade" className="text-right">
                Trade
              </Label>
              <Input
                id="task-trade"
                placeholder="e.g., Electrical, Plumbing, etc."
                className="col-span-3"
                value={newTaskData.trade}
                onChange={(e) =>
                  setNewTaskData((prev) => ({ ...prev, trade: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-start-date" className="text-right">
                Start Date
              </Label>
              <Input
                id="task-start-date"
                type="date"
                className="col-span-3"
                value={newTaskData.startDate}
                onChange={(e) =>
                  setNewTaskData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-end-date" className="text-right">
                End Date
              </Label>
              <Input
                id="task-end-date"
                type="date"
                className="col-span-3"
                value={newTaskData.endDate}
                onChange={(e) =>
                  setNewTaskData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-due-date" className="text-right">
                Due Date
              </Label>
              <Input
                id="task-due-date"
                type="date"
                className="col-span-3"
                value={newTaskData.dueDate}
                onChange={(e) =>
                  setNewTaskData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-priority" className="text-right">
                Priority
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm col-span-3"
                value={newTaskData.priority}
                onChange={(e) =>
                  setNewTaskData((prev) => ({
                    ...prev,
                    priority: e.target.value as "high" | "medium" | "low",
                  }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateTaskDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task information and assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task-name" className="text-right">
                Task Name
              </Label>
              <Input
                id="edit-task-name"
                placeholder="Enter task name"
                className="col-span-3"
                value={editTaskData.name}
                onChange={(e) =>
                  setEditTaskData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task-project" className="text-right">
                Project
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm col-span-3"
                value={editTaskData.project}
                onChange={(e) =>
                  setEditTaskData((prev) => ({
                    ...prev,
                    project: e.target.value,
                  }))
                }
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task-phase" className="text-right">
                Phase
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm col-span-3"
                value={editTaskData.phaseId}
                onChange={(e) =>
                  setEditTaskData((prev) => ({
                    ...prev,
                    phaseId: e.target.value,
                  }))
                }
              >
                <option value="">No phase assigned</option>
                {editTaskData.project &&
                  projects
                    .find((p) => p.name === editTaskData.project)
                    ?.phases.sort((a, b) => a.order - b.order)
                    .map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.name}
                      </option>
                    ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task-trade" className="text-right">
                Trade
              </Label>
              <Input
                id="edit-task-trade"
                placeholder="e.g., Electrical, Plumbing, etc."
                className="col-span-3"
                value={editTaskData.trade}
                onChange={(e) =>
                  setEditTaskData((prev) => ({
                    ...prev,
                    trade: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task-start-date" className="text-right">
                Start Date
              </Label>
              <Input
                id="edit-task-start-date"
                type="date"
                className="col-span-3"
                value={editTaskData.startDate}
                onChange={(e) =>
                  setEditTaskData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task-end-date" className="text-right">
                End Date
              </Label>
              <Input
                id="edit-task-end-date"
                type="date"
                className="col-span-3"
                value={editTaskData.endDate}
                onChange={(e) =>
                  setEditTaskData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task-due-date" className="text-right">
                Due Date
              </Label>
              <Input
                id="edit-task-due-date"
                type="date"
                className="col-span-3"
                value={editTaskData.dueDate}
                onChange={(e) =>
                  setEditTaskData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task-status" className="text-right">
                Status
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm col-span-3"
                value={editTaskData.status}
                onChange={(e) =>
                  setEditTaskData((prev) => ({
                    ...prev,
                    status: e.target.value as
                      | "planned"
                      | "in-progress"
                      | "delayed"
                      | "completed",
                  }))
                }
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="delayed">Delayed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task-progress" className="text-right">
                Progress %
              </Label>
              <Input
                id="edit-task-progress"
                type="number"
                min="0"
                max="100"
                className="col-span-3"
                value={editTaskData.progress}
                onChange={(e) =>
                  setEditTaskData((prev) => ({
                    ...prev,
                    progress: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task-priority" className="text-right">
                Priority
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm col-span-3"
                value={editTaskData.priority}
                onChange={(e) =>
                  setEditTaskData((prev) => ({
                    ...prev,
                    priority: e.target.value as "high" | "medium" | "low",
                  }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEditTaskDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>Update Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
