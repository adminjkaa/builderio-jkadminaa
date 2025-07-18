import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  ArrowUp,
  ArrowDown,
  Layers,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useData, type Phase, type Project } from "@/lib/data-context";

interface PhaseManagementProps {
  projectId?: string;
}

export const PhaseManagement: React.FC<PhaseManagementProps> = ({
  projectId,
}) => {
  const { projects, addPhase, updatePhase, deletePhase, reorderPhases, tasks } =
    useData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    projectId ? projects.find((p) => p.id === projectId) || null : null,
  );

  // Keep selectedProject in sync with projects data
  useEffect(() => {
    if (selectedProject) {
      const updatedProject = projects.find((p) => p.id === selectedProject.id);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
    }
  }, [projects, selectedProject?.id]);
  const [showCreatePhaseDialog, setShowCreatePhaseDialog] = useState(false);
  const [showEditPhaseDialog, setShowEditPhaseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [phaseToDelete, setPhaseToDelete] = useState<Phase | null>(null);

  const [newPhaseData, setNewPhaseData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    color: "#8B5CF6",
    order: 0,
  });

  const [editPhaseData, setEditPhaseData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    color: "#8B5CF6",
    order: 0,
  });

  const defaultColors = [
    "#8B5CF6",
    "#F59E0B",
    "#10B981",
    "#EF4444",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#8B5CF6",
  ];

  const handleCreatePhase = () => {
    if (
      selectedProject &&
      newPhaseData.name &&
      newPhaseData.startDate &&
      newPhaseData.endDate
    ) {
      addPhase(selectedProject.id, {
        ...newPhaseData,
        order: selectedProject.phases.length,
      });
      setShowCreatePhaseDialog(false);
      setNewPhaseData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        color: "#8B5CF6",
        order: 0,
      });
    }
  };

  const handleEditPhase = (phase: Phase) => {
    setEditingPhase(phase);
    setEditPhaseData({
      name: phase.name,
      description: phase.description || "",
      startDate: phase.startDate,
      endDate: phase.endDate,
      color: phase.color,
      order: phase.order,
    });
    setShowEditPhaseDialog(true);
  };

  const handleUpdatePhase = () => {
    if (selectedProject && editingPhase) {
      updatePhase(selectedProject.id, editingPhase.id, editPhaseData);
      setShowEditPhaseDialog(false);
      setEditingPhase(null);
    }
  };

  const handleDeletePhase = (phase: Phase) => {
    setPhaseToDelete(phase);
    setShowDeleteDialog(true);
  };

  const confirmDeletePhase = () => {
    if (selectedProject && phaseToDelete) {
      deletePhase(selectedProject.id, phaseToDelete.id);
      setPhaseToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleMovePhase = (phaseId: string, direction: "up" | "down") => {
    if (!selectedProject) return;

    const phases = [...selectedProject.phases].sort(
      (a, b) => a.order - b.order,
    );
    const currentIndex = phases.findIndex((p) => p.id === phaseId);

    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === phases.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newPhases = [...phases];
    [newPhases[currentIndex], newPhases[newIndex]] = [
      newPhases[newIndex],
      newPhases[currentIndex],
    ];

    reorderPhases(
      selectedProject.id,
      newPhases.map((p) => p.id),
    );
  };

  const getPhaseTaskCount = (phaseId: string) => {
    return tasks.filter((task) => task.phaseId === phaseId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Phase Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage project phases to organize tasks
          </p>
        </div>
        {!projectId && (
          <select
            className="flex h-10 w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedProject?.id || ""}
            onChange={(e) => {
              const project = projects.find((p) => p.id === e.target.value);
              setSelectedProject(project || null);
            }}
          >
            <option value="">Select a project...</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {!selectedProject ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {projects.length === 0
                ? "No Projects Available"
                : "Select a Project"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {projects.length === 0
                ? "Create a project first before managing phases."
                : "Choose a project from the dropdown above to manage its phases."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium">{selectedProject.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedProject.phases.length} phases
              </p>
            </div>
            <Button onClick={() => setShowCreatePhaseDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Phase
            </Button>
          </div>

          {selectedProject.phases.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-medium mb-2">No phases created yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first phase to organize tasks by project stages.
                </p>
                <Button onClick={() => setShowCreatePhaseDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Phase
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  Project Phases ({selectedProject.phases.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedProject.phases
                    .sort((a, b) => a.order - b.order)
                    .map((phase, index) => (
                      <div
                        key={phase.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: phase.color }}
                            />
                            <h4 className="font-medium">{phase.name}</h4>
                            <Badge variant="outline">
                              {getPhaseTaskCount(phase.id)} tasks
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Start:{" "}
                              {new Date(phase.startDate).toLocaleDateString()}
                            </span>
                            <span>
                              End:{" "}
                              {new Date(phase.endDate).toLocaleDateString()}
                            </span>
                            <span>Order: {index + 1}</span>
                          </div>
                          {phase.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {phase.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMovePhase(phase.id, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMovePhase(phase.id, "down")}
                            disabled={
                              index === selectedProject.phases.length - 1
                            }
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPhase(phase)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePhase(phase)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Create Phase Dialog */}
      <Dialog
        open={showCreatePhaseDialog}
        onOpenChange={setShowCreatePhaseDialog}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Phase</DialogTitle>
            <DialogDescription>
              Add a new phase to organize your project tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phase-name" className="text-right">
                Phase Name
              </Label>
              <Input
                id="phase-name"
                placeholder="e.g., Foundation, Framing, etc."
                className="col-span-3"
                value={newPhaseData.name}
                onChange={(e) =>
                  setNewPhaseData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phase-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="phase-description"
                placeholder="Phase description (optional)"
                className="col-span-3"
                value={newPhaseData.description}
                onChange={(e) =>
                  setNewPhaseData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phase-start-date" className="text-right">
                Start Date
              </Label>
              <Input
                id="phase-start-date"
                type="date"
                className="col-span-3"
                value={newPhaseData.startDate}
                onChange={(e) =>
                  setNewPhaseData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phase-end-date" className="text-right">
                End Date
              </Label>
              <Input
                id="phase-end-date"
                type="date"
                className="col-span-3"
                value={newPhaseData.endDate}
                onChange={(e) =>
                  setNewPhaseData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phase-color" className="text-right">
                Color
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded border-2 ${
                        newPhaseData.color === color
                          ? "border-primary"
                          : "border-muted"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setNewPhaseData((prev) => ({ ...prev, color }))
                      }
                    />
                  ))}
                </div>
                <Input
                  id="phase-color"
                  type="color"
                  className="w-20"
                  value={newPhaseData.color}
                  onChange={(e) =>
                    setNewPhaseData((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCreatePhaseDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePhase}>Create Phase</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Phase Dialog */}
      <Dialog open={showEditPhaseDialog} onOpenChange={setShowEditPhaseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Phase</DialogTitle>
            <DialogDescription>
              Update phase information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phase-name" className="text-right">
                Phase Name
              </Label>
              <Input
                id="edit-phase-name"
                placeholder="e.g., Foundation, Framing, etc."
                className="col-span-3"
                value={editPhaseData.name}
                onChange={(e) =>
                  setEditPhaseData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phase-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-phase-description"
                placeholder="Phase description (optional)"
                className="col-span-3"
                value={editPhaseData.description}
                onChange={(e) =>
                  setEditPhaseData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phase-start-date" className="text-right">
                Start Date
              </Label>
              <Input
                id="edit-phase-start-date"
                type="date"
                className="col-span-3"
                value={editPhaseData.startDate}
                onChange={(e) =>
                  setEditPhaseData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phase-end-date" className="text-right">
                End Date
              </Label>
              <Input
                id="edit-phase-end-date"
                type="date"
                className="col-span-3"
                value={editPhaseData.endDate}
                onChange={(e) =>
                  setEditPhaseData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phase-color" className="text-right">
                Color
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded border-2 ${
                        editPhaseData.color === color
                          ? "border-primary"
                          : "border-muted"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setEditPhaseData((prev) => ({ ...prev, color }))
                      }
                    />
                  ))}
                </div>
                <Input
                  id="edit-phase-color"
                  type="color"
                  className="w-20"
                  value={editPhaseData.color}
                  onChange={(e) =>
                    setEditPhaseData((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEditPhaseDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePhase}>Update Phase</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Phase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{phaseToDelete?.name}"? This will
              unassign all tasks from this phase. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePhase}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Phase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PhaseManagement;
