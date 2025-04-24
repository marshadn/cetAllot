import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export const DepartmentDialog = ({
  open,
  onOpenChange,
  department,
  onSave,
  onChange,
  isLoading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {department?.id ? "Edit Department" : "New Department"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="dept-name">Department Name</Label>
            <Input
              id="dept-name"
              placeholder="Department Name"
              value={department?.name || ""}
              onChange={(e) =>
                onChange({ ...department, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="total-seats">Total Seats</Label>
            <Input
              id="total-seats"
              type="number"
              placeholder="Total Seats"
              value={department?.totalSeats || 0}
              onChange={(e) =>
                onChange({
                  ...department,
                  totalSeats: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dept-description">Description</Label>
            <Textarea
              id="dept-description"
              placeholder="Department description"
              value={department?.description || ""}
              onChange={(e) =>
                onChange({
                  ...department,
                  description: e.target.value,
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Department"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
