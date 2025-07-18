import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Construction, Users, Eye, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, UserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function Index() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(username, password, selectedRole);
      if (success) {
        navigate(`/dashboard/${selectedRole}`);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfigs = {
    admin: {
      icon: Construction,
      title: "Admin Access",
      description: "Full project management and user administration",
      color: "border-primary bg-primary/5",
      features: [
        "Create & manage projects",
        "User management",
        "Full timeline control",
        "Data analytics",
      ],
      credentials: "Username: admin | Password: admin123",
    },
    member: {
      icon: Users,
      title: "Team Member",
      description: "Project collaboration and progress updates",
      color: "border-info bg-info/5",
      features: [
        "View assigned projects",
        "Upload progress photos",
        "Update task completion",
        "Track milestones",
      ],
      credentials: "Create users via Admin dashboard",
    },
    client: {
      icon: Eye,
      title: "Client View",
      description: "Read-only project monitoring and progress tracking",
      color: "border-accent bg-accent/5",
      features: [
        "View project timeline",
        "Monitor progress",
        "See uploaded media",
        "Track milestones",
      ],
      credentials: "Create users via Admin dashboard",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Timeline Visualizer
              </h1>
              <p className="text-sm text-muted-foreground">
                Construction Project Management Platform
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Streamline Your Construction Projects
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Manage timelines, track progress, and collaborate effectively with
              our comprehensive project management platform.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Gantt Timeline</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Multi-Role Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Construction className="w-4 h-4" />
                <span>Construction Focused</span>
              </div>
            </div>
          </div>

          {/* Role Selection & Login */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Role Cards */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold mb-4">Choose Your Role</h3>
              <div className="space-y-4">
                {Object.entries(roleConfigs).map(([role, config]) => {
                  const Icon = config.icon;
                  return (
                    <Card
                      key={role}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        selectedRole === role
                          ? config.color
                          : "hover:border-border",
                      )}
                      onClick={() => setSelectedRole(role as UserRole)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "flex items-center justify-center w-12 h-12 rounded-lg",
                              selectedRole === role
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">
                              {config.title}
                            </h4>
                            <p className="text-muted-foreground mb-3">
                              {config.description}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {config.features.map((feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-muted-foreground"
                                >
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 p-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground">
                              {config.credentials}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Login Form */}
            <div className="lg:sticky lg:top-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center">
                    Sign In as {roleConfigs[selectedRole].title.split(" ")[0]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    {error && (
                      <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Demo Notice */}
              <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-info rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-info-foreground text-xs font-bold">
                      i
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-info mb-1">Demo Version</p>
                    <p className="text-muted-foreground">
                      This is a demonstration version with mock data. Use the
                      credentials shown in each role card to explore different
                      user experiences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
