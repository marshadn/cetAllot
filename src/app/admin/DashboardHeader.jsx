"use client";
import { Button } from "@/components/ui/Button";
import { Check, UploadCloud } from "lucide-react";
import { runAllotmentHandler } from "../utils/runAllotmentHandler";
import uploadRealData from "../utils/uploadRealData";
import { useState } from "react";

export const DashboardHeader = () => {
  const [loadingAllotment, setLoadingAllotment] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleRunAllotment = async () => {
    setLoadingAllotment(true);
    const result = await runAllotmentHandler();
    setLoadingAllotment(false);

    if (result.success) {
      alert("Allotment completed successfully!");
    } else {
      alert("Allotment failed. Check console for errors.");
    }
  };

  const handleUploadRealData = async () => {
    setUploading(true);
    try {
      await uploadRealData();
      alert("Real data uploaded successfully.");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Uploading real data failed. Check console.");
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="w-full sm:w-auto">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage BTech applications and departments
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        {/* <Button 
          variant="outline" 
          onClick={handleUploadRealData} 
          disabled={uploading}
          className="w-full sm:w-auto justify-center sm:justify-start"
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Real Data"}
        </Button> */}
        <Button 
          variant="outline" 
          onClick={handleRunAllotment} 
          disabled={loadingAllotment}
          className="w-full sm:w-auto justify-center sm:justify-start"
        >
          <Check className="mr-2 h-4 w-4" />
          {loadingAllotment ? "Running..." : "Run Allotment"}
        </Button>
      </div>
    </div>
  );
};