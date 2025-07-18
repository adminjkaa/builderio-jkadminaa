import React, { createContext, useContext, useState, ReactNode } from "react";
import { useData } from "./data-context";

export type UserRole = "admin" | "member" | "client";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  password: string;
  assignedProjects?: string[];
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "planned" | "in-progress" | "delayed" | "completed";
  progress: number;
  phases: ProjectPhase[];
  assignedMembers: string[];
  assignedClients: string[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
  color: string;
}

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "planned" | "in-progress" | "delayed" | "completed";
  assignedTo?: string;
  dependencies?: string[];
  milestones: Milestone[];
  media: Media[];
  trade: string;
}

export interface Milestone {
  id: string;
  name: string;
  type: "inspection" | "approval" | "handover";
  date: string;
  completed: boolean;
}

export interface Media {
  id: string;
  url: string;
  type: "image" | "video";
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    username: string,
    password: string,
    role: UserRole,
  ) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Initial admin user - will be created automatically
const initialAdminUser: User = {
  id: "admin",
  username: "admin",
  role: "admin",
  name: "Administrator",
  password: "admin123",
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProviderInner: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { users } = useData();

  const login = async (
    username: string,
    password: string,
    role: UserRole,
  ): Promise<boolean> => {
    // Simple authentication - in production, this should be secured
    const userData = users.find(
      (u) => u.username === username && u.role === role,
    );

    if (userData && userData.password === password) {
      setUser(userData);
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Wrapper that ensures DataProvider is available
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <AuthProviderInner>{children}</AuthProviderInner>;
};
