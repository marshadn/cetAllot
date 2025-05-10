"use client";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import { runAllotmentHandler } from "../utils/runAllotmentHandler";
import { useState } from "react";

export const DashboardHeader = () => {
  const [loading, setLoading] = useState(false);

  const handleRunAllotment = async () => {
    setLoading(true);
    const result = await runAllotmentHandler();
    setLoading(false);

    if (result.success) {
      alert("Allotment completed successfully!");
    } else {
      alert("Allotment failed. Check console for errors.");
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage BTech applications and departments
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleRunAllotment} disabled={loading}>
          <Check className="mr-2 h-4 w-4" />
          {loading ? "Running..." : "Run Allotment"}
        </Button>
      </div>
    </div>
  );
};
