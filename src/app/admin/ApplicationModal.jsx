import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { ApplicationForm } from "./ApplicationForm";

const ApplicationModal = ({ open, onClose, onSubmit, departments }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <ApplicationForm onSuccess={onSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
