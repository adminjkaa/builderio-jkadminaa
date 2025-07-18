import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MediaGallery() {
  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Media Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Media gallery functionality will be implemented here. This includes
            viewing and managing all media files uploaded across different
            projects and tasks.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
