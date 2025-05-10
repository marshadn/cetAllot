import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "@/firebase";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import {
  Download,
  Loader2,
  Pencil,
  Trash2,
  PlusCircle
} from "lucide-react";
import ApplicationModal from "./ApplicationModal";
import { toast } from "sonner";
import * as XLSX from "xlsx"; // ✅ added for export

export const ApplicationTable = ({
  departments,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  searchTerm,
  setSearchTerm,
  isLoading,
  onEdit,
  onNewApplication,
}) => {
  const [applications, setApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "applications"), (snapshot) => {
      const apps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplications(apps);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this application?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "applications", id));
      toast.success("Application deleted successfully");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    }
  };

  const handleNewApplication = (data) => {
    onNewApplication(data);
    setIsModalOpen(false);
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;

    const matchesDepartment =
      departmentFilter === "all" || app.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // ✅ EXPORT FUNCTIONALITY
  const onExport = () => {
    const exportData = filteredApps.map((app) => ({
      Name: app.name,
      Email: app.email,
      Address: app.address,
      Age: app.age,
      Caste: app.caste,
      Religion: app.religion,
      Category: app.category,
      Distance: app.distance,
      Mark: app.mark,
      Phone: app.phone,
      "Priority 1": app.priorityChoices?.[1],
      "Priority 2": app.priorityChoices?.[2],
      "Priority 3": app.priorityChoices?.[3],
      "LET Reg No": app.letRegNo,
      "LET Rank": app.letRank,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

    XLSX.writeFile(workbook, "Applications.xlsx");
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Application
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Caste</TableHead>
            <TableHead>Religion</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Mark</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Priority 1</TableHead>
            <TableHead>Priority 2</TableHead>
            <TableHead>Priority 3</TableHead>
            <TableHead>Let Reg No</TableHead>
            <TableHead>Let Rank</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredApps.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.name}</TableCell>
              <TableCell>{app.email}</TableCell>
              <TableCell>{app.address}</TableCell>
              <TableCell>{app.age}</TableCell>
              <TableCell>{app.caste}</TableCell>
              <TableCell>{app.religion}</TableCell>
              <TableCell>{app.category}</TableCell>
              <TableCell>{app.distance}</TableCell>
              <TableCell>{app.mark}</TableCell>
              <TableCell>{app.phone}</TableCell>
              <TableCell>{app.priorityChoices?.[1]}</TableCell>
              <TableCell>{app.priorityChoices?.[2]}</TableCell>
              <TableCell>{app.priorityChoices?.[3]}</TableCell>
              <TableCell>{app.letRegNo}</TableCell>
              <TableCell>{app.letRank}</TableCell>

              <TableCell className="text-right space-x-2 flex items-center">
                <Button size="sm" variant="outline" onClick={() => onEdit(app)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(app.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
              
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          className="gap-1"
          onClick={onExport}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export
        </Button>
      </div>

      <ApplicationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewApplication}
        departments={departments}
      />
    </>
  );
};
