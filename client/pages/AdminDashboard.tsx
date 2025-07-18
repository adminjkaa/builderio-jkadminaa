import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  Construction,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-context";
import TaskManagement from "@/components/TaskManagement";
import UserManagement from "@/components/UserManagement";
import MediaGallery from "@/components/MediaGallery";
import PhaseManagement from "@/components/PhaseManagement";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { projects, addProject, updateProject, deleteProject, users, tasks } =
    useData();
  const navigate = useNavigate();
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [newProjectData, setNewProjectData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [selectedProjectForDeletion, setSelectedProjectForDeletion] =
    useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNewProject = () => {
    setNewProjectData({
      name: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setShowNewProjectDialog(true);
  };

  const handleSettings = () => {
    setShowSettingsDialog(true);
  };

  const handleEditProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setEditingProject(project);
      setShowEditProjectDialog(true);
    }
  };

  const handleViewProjectDetails = (projectId: string) => {
    console.log("View project details:", projectId);
    // TODO: Implement project details dialog or route
    // For now, just show an alert to prevent crashes
    alert(
      `Project details for: ${projectId}\nThis feature will be implemented soon.`,
    );
  };

  const handleViewAnalytics = () => {
    setShowAnalyticsDialog(true);
  };

  const handleCreateProject = () => {
    if (
      newProjectData.name &&
      newProjectData.startDate &&
      newProjectData.endDate
    ) {
      addProject({
        name: newProjectData.name,
        startDate: newProjectData.startDate,
        endDate: newProjectData.endDate,
        status: "planned",
        progress: 0,
        description: newProjectData.description,
        phases: [],
      });
      setShowNewProjectDialog(false);
      setNewProjectData({
        name: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    }
  };

  const handleUpdateProject = () => {
    if (editingProject && editingProject.id) {
      updateProject(editingProject.id, {
        name: editingProject.name,
        status: editingProject.status,
        progress: editingProject.progress,
        endDate: editingProject.endDate,
      });
      setShowEditProjectDialog(false);
      setEditingProject(null);
    }
  };

  const handleChangePassword = () => {
    setShowChangePasswordDialog(true);
    setShowSettingsDialog(false);
  };

  const handleUpdatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirmation do not match!");
      return;
    }
    if (passwordData.currentPassword !== "admin123") {
      alert("Current password is incorrect!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long!");
      return;
    }

    // Update admin password (in a real app, this would be an API call)
    console.log("Password updated successfully");
    alert("Password updated successfully!");
    setShowChangePasswordDialog(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleDownloadAllMedia = () => {
    // In a real app, this would download all media files
    console.log("Downloading all media...");
    alert(
      "Media download started! This feature will be implemented with backend integration.",
    );
  };

  const handleSiteBackup = () => {
    // In a real app, this would create a site backup
    console.log("Creating site backup...");
    alert(
      "Site backup started! This feature will be implemented with backend integration.",
    );
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, this would update the global theme
    document.documentElement.classList.toggle("dark");
  };

  const handleToggleMaintenanceMode = () => {
    setIsMaintenanceMode(!isMaintenanceMode);
    if (!isMaintenanceMode) {
      alert(
        "Maintenance mode enabled. New users will see a maintenance message.",
      );
    } else {
      alert("Maintenance mode disabled. Site is now accessible to all users.");
    }
  };

  const handleDeleteProject = () => {
    if (selectedProjectForDeletion) {
      const project = projects.find((p) => p.id === selectedProjectForDeletion);
      if (
        project &&
        confirm(
          `Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`,
        )
      ) {
        deleteProject(selectedProjectForDeletion);
        setSelectedProjectForDeletion("");
      }
    }
  };

  // Projects now come from data context

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "in-progress").length,
    delayedProjects: projects.filter((p) => p.status === "delayed").length,
    completedTasks: projects.reduce(
      (acc, p) => acc + (p.totalTasks - p.activeTasks),
      0,
    ),
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Projects
                  </p>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                </div>
                <Construction className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Projects
                  </p>
                  <p className="text-2xl font-bold">{stats.activeProjects}</p>
                </div>
                <Clock className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Delayed Projects
                  </p>
                  <p className="text-2xl font-bold">{stats.delayedProjects}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed Tasks
                  </p>
                  <p className="text-2xl font-bold">{stats.completedTasks}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Projects</h2>
            <div className="flex gap-3">
              <Button onClick={handleNewProject}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Due: {new Date(project.endDate).toLocaleDateString()}
                        </span>
                        <span>{project.members} members</span>
                        <span>
                          {project.activeTasks} of {project.totalTasks} tasks
                          active
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Link to={`/timeline/${project.id}`}>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Timeline
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditProject(project.id)}
                      >
                        Edit
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleViewProjectDetails(project.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-6 flex-col gap-3"
                onClick={handleNewProject}
              >
                <Plus className="w-8 h-8 text-primary" />
                <span>Create Project</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-6 flex-col gap-3"
                onClick={handleViewAnalytics}
              >
                <BarChart3 className="w-8 h-8 text-accent" />
                <span>View Analytics</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-6 flex-col gap-3"
                onClick={handleSettings}
              >
                <Settings className="w-8 h-8 text-muted-foreground" />
                <span>System Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Phase Management Section */}
        <PhaseManagement />

        {/* Task Management Section */}
        <TaskManagement />

        {/* User Management Section */}
        <UserManagement />

        {/* Media Gallery Section */}
        <MediaGallery />

        {/* New Project Dialog */}
        <Dialog
          open={showNewProjectDialog}
          onOpenChange={setShowNewProjectDialog}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Enter the details for your new construction project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project-name" className="text-right">
                  Project Name
                </Label>
                <Input
                  id="project-name"
                  placeholder="Enter project name"
                  className="col-span-3"
                  value={newProjectData.name}
                  onChange={(e) =>
                    setNewProjectData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  className="col-span-3"
                  value={newProjectData.startDate}
                  onChange={(e) =>
                    setNewProjectData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-date" className="text-right">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  className="col-span-3"
                  value={newProjectData.endDate}
                  onChange={(e) =>
                    setNewProjectData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Project description"
                  className="col-span-3"
                  value={newProjectData.description}
                  onChange={(e) =>
                    setNewProjectData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNewProjectDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>System Settings</DialogTitle>
              <DialogDescription>
                Essential system administration options.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Security Section */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Security
                </h4>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleChangePassword}
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Change Admin Password
                </Button>
              </div>

              {/* Data Management Section */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Data Management
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={handleDownloadAllMedia}
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    </svg>
                    Download All Media
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={handleSiteBackup}
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Create Site Backup
                  </Button>
                </div>
              </div>

              {/* Project Management Section */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Project Management
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedProjectForDeletion}
                    onChange={(e) =>
                      setSelectedProjectForDeletion(e.target.value)
                    }
                  >
                    <option value="">Select project to delete...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="destructive"
                    className="justify-start"
                    onClick={handleDeleteProject}
                    disabled={!selectedProjectForDeletion}
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Selected Project
                  </Button>
                </div>
              </div>

              {/* Appearance Section */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Appearance
                </h4>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                    <span className="font-medium">Dark Mode</span>
                  </div>
                  <Button
                    variant={isDarkMode ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleDarkMode}
                  >
                    {isDarkMode ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>

              {/* Maintenance Section */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Maintenance
                </h4>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <span className="font-medium">Maintenance Mode</span>
                      <p className="text-xs text-muted-foreground">
                        Prevent new user access
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={isMaintenanceMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleToggleMaintenanceMode}
                  >
                    {isMaintenanceMode ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSettingsDialog(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog
          open={showChangePasswordDialog}
          onOpenChange={setShowChangePasswordDialog}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Change Admin Password</DialogTitle>
              <DialogDescription>
                Update your administrator password. Make sure to use a strong
                password.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangePasswordDialog(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdatePassword}>Update Password</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Project Dialog */}
        <Dialog
          open={showEditProjectDialog}
          onOpenChange={setShowEditProjectDialog}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update the details for {editingProject?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-project-name" className="text-right">
                  Project Name
                </Label>
                <Input
                  id="edit-project-name"
                  placeholder="Enter project name"
                  className="col-span-3"
                  value={editingProject?.name || ""}
                  onChange={(e) =>
                    setEditingProject((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm col-span-3"
                  value={editingProject?.status || ""}
                  onChange={(e) =>
                    setEditingProject((prev) => ({
                      ...prev,
                      status: e.target.value,
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
                <Label htmlFor="edit-progress" className="text-right">
                  Progress %
                </Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  className="col-span-3"
                  value={editingProject?.progress || 0}
                  onChange={(e) =>
                    setEditingProject((prev) => ({
                      ...prev,
                      progress: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-end-date" className="text-right">
                  End Date
                </Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  className="col-span-3"
                  value={editingProject?.endDate || ""}
                  onChange={(e) =>
                    setEditingProject((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditProjectDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateProject}>Update Project</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog
          open={showAnalyticsDialog}
          onOpenChange={setShowAnalyticsDialog}
        >
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Project Analytics</DialogTitle>
              <DialogDescription>
                Comprehensive overview of all projects and performance metrics.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {stats.totalProjects}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Projects
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">
                        {stats.activeProjects}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active Projects
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {stats.delayedProjects}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Delayed Projects
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-info">
                        {stats.completedTasks}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Completed Tasks
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Project Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map((project) => {
                      const overallProgress = project.progress;
                      return (
                        <div key={project.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">
                                {project.name}
                              </span>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>
                            <span className="text-sm font-medium">
                              {overallProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all duration-300"
                              style={{ width: `${overallProgress}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Start:{" "}
                              {new Date(project.startDate).toLocaleDateString()}
                            </span>
                            <span>
                              End:{" "}
                              {new Date(project.endDate).toLocaleDateString()}
                            </span>
                            <span>Tasks: {project.totalTasks}</span>
                            <span>Members: {project.members}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* System Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">User Distribution</h4>
                      <div className="space-y-2">
                        {["admin", "member", "client"].map((role) => {
                          const count = users.filter(
                            (u) => u.role === role,
                          ).length;
                          const percentage =
                            users.length > 0 ? (count / users.length) * 100 : 0;
                          return (
                            <div
                              key={role}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm capitalize">
                                {role}s
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary rounded-full h-2"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">
                        Task Status Distribution
                      </h4>
                      <div className="space-y-2">
                        {["planned", "in-progress", "completed", "delayed"].map(
                          (status) => {
                            const count = tasks.filter(
                              (t) => t.status === status,
                            ).length;
                            const percentage =
                              tasks.length > 0
                                ? (count / tasks.length) * 100
                                : 0;
                            return (
                              <div
                                key={status}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm capitalize">
                                  {status.replace("-", " ")}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-muted rounded-full h-2">
                                    <div
                                      className="bg-primary rounded-full h-2"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm">{count}</span>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAnalyticsDialog(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
