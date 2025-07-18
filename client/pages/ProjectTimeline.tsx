import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export default function ProjectTimeline() {
  const { projectId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBack = () => {
    navigate(`/dashboard/${user?.role}`);
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
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Project Timeline</h1>
                <p className="text-sm text-muted-foreground">
                  Project ID: {projectId || "All Projects"}
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
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline & Gantt Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Project timeline and Gantt chart functionality will be implemented
              here. This will include interactive timeline visualization, task
              dependencies, milestone tracking, and progress monitoring.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
