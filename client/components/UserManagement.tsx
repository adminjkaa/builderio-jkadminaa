import React, { useState } from "react";
import { Plus, Edit, Trash2, Users, Eye, EyeOff } from "lucide-react";
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
import { useData, type User } from "@/lib/data-context";

export const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, projects } = useData();
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [newUserData, setNewUserData] = useState({
    name: "",
    username: "",
    password: "",
    role: "member" as "admin" | "member" | "client",
    assignedProjects: [] as string[],
  });

  const [editUserData, setEditUserData] = useState({
    name: "",
    username: "",
    password: "",
    role: "member" as "admin" | "member" | "client",
    assignedProjects: [] as string[],
  });

  const handleCreateUser = () => {
    if (newUserData.name && newUserData.username && newUserData.password) {
      // Check if username already exists
      if (users.some((user) => user.username === newUserData.username)) {
        alert("Username already exists! Please choose a different username.");
        return;
      }

      addUser({
        name: newUserData.name,
        username: newUserData.username,
        password: newUserData.password,
        role: newUserData.role,
        assignedProjects:
          newUserData.role === "client"
            ? newUserData.assignedProjects
            : undefined,
      });
      setShowCreateUserDialog(false);
      setNewUserData({
        name: "",
        username: "",
        password: "",
        role: "member",
        assignedProjects: [],
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserData({
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role,
      assignedProjects: user.assignedProjects || [],
    });
    setShowEditUserDialog(true);
  };

  const handleUpdateUser = () => {
    if (
      editingUser &&
      editUserData.name &&
      editUserData.username &&
      editUserData.password
    ) {
      // Check if username already exists (excluding current user)
      if (
        users.some(
          (user) =>
            user.username === editUserData.username &&
            user.id !== editingUser.id,
        )
      ) {
        alert("Username already exists! Please choose a different username.");
        return;
      }

      updateUser(editingUser.id, {
        name: editUserData.name,
        username: editUserData.username,
        password: editUserData.password,
        role: editUserData.role,
        assignedProjects:
          editUserData.role === "client"
            ? editUserData.assignedProjects
            : undefined,
      });
      setShowEditUserDialog(false);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setUserToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive text-destructive-foreground";
      case "member":
        return "bg-info text-info-foreground";
      case "client":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateUserDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-medium mb-2">No users found</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first user to get started.
            </p>
            <Button onClick={() => setShowCreateUserDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First User
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{user.name}</h4>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>@{user.username}</span>
                      <span>Password: {user.password.replace(/./g, "•")}</span>
                      {user.role === "client" &&
                        user.assignedProjects &&
                        user.assignedProjects.length > 0 && (
                          <span>Projects: {user.assignedProjects.length}</span>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {user.username !== "admin" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create User Dialog */}
      <Dialog
        open={showCreateUserDialog}
        onOpenChange={setShowCreateUserDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with login credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-user-name" className="text-right">
                Full Name
              </Label>
              <Input
                id="new-user-name"
                placeholder="Enter full name"
                className="col-span-3"
                value={newUserData.name}
                onChange={(e) =>
                  setNewUserData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-username" className="text-right">
                Username
              </Label>
              <Input
                id="new-username"
                placeholder="Enter username"
                className="col-span-3"
                value={newUserData.username}
                onChange={(e) =>
                  setNewUserData((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">
                Password
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-role" className="text-right">
                Role
              </Label>
              <select
                id="new-role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm col-span-3"
                value={newUserData.role}
                onChange={(e) =>
                  setNewUserData((prev) => ({
                    ...prev,
                    role: e.target.value as "admin" | "member" | "client",
                  }))
                }
              >
                <option value="member">Member</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {newUserData.role === "client" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-projects" className="text-right">
                  Assigned Projects
                </Label>
                <div className="col-span-3 space-y-2">
                  {projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No projects available
                    </p>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`new-project-${project.id}`}
                          checked={newUserData.assignedProjects.includes(
                            project.id,
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUserData((prev) => ({
                                ...prev,
                                assignedProjects: [
                                  ...prev.assignedProjects,
                                  project.id,
                                ],
                              }));
                            } else {
                              setNewUserData((prev) => ({
                                ...prev,
                                assignedProjects: prev.assignedProjects.filter(
                                  (id) => id !== project.id,
                                ),
                              }));
                            }
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <Label
                          htmlFor={`new-project-${project.id}`}
                          className="text-sm"
                        >
                          {project.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateUserDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-user-name" className="text-right">
                Full Name
              </Label>
              <Input
                id="edit-user-name"
                placeholder="Enter full name"
                className="col-span-3"
                value={editUserData.name}
                onChange={(e) =>
                  setEditUserData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-username" className="text-right">
                Username
              </Label>
              <Input
                id="edit-username"
                placeholder="Enter username"
                className="col-span-3"
                value={editUserData.username}
                onChange={(e) =>
                  setEditUserData((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                Password
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={editUserData.password}
                  onChange={(e) =>
                    setEditUserData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                >
                  {showEditPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <select
                id="edit-role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm col-span-3"
                value={editUserData.role}
                onChange={(e) =>
                  setEditUserData((prev) => ({
                    ...prev,
                    role: e.target.value as "admin" | "member" | "client",
                  }))
                }
              >
                <option value="member">Member</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {editUserData.role === "client" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-projects" className="text-right">
                  Assigned Projects
                </Label>
                <div className="col-span-3 space-y-2">
                  {projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No projects available
                    </p>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`edit-project-${project.id}`}
                          checked={editUserData.assignedProjects.includes(
                            project.id,
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditUserData((prev) => ({
                                ...prev,
                                assignedProjects: [
                                  ...prev.assignedProjects,
                                  project.id,
                                ],
                              }));
                            } else {
                              setEditUserData((prev) => ({
                                ...prev,
                                assignedProjects: prev.assignedProjects.filter(
                                  (id) => id !== project.id,
                                ),
                              }));
                            }
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <Label
                          htmlFor={`edit-project-${project.id}`}
                          className="text-sm"
                        >
                          {project.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEditUserDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Update User</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{userToDelete?.name}"? This
              action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
