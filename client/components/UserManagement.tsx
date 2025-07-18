import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserManagement() {
  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            User management functionality will be implemented here. This
            includes creating, updating, and managing users with different roles
            (admin, member, client).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
