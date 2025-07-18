import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TaskManagement() {
  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Task management functionality will be implemented here. This
            includes creating, updating, and managing tasks across projects.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
