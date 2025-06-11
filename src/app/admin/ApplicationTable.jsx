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
import * as XLSX from "xlsx";

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
    if (!window.confirm("Are you sure you want to delete this application?")) return;
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

  const onExport = () => {
    const exportData = filteredApps.map((app) => ({
      Name: app.name,
      Email: app.email,
      Caste: app.caste,
      Religion: app.religion,
      Category: app.reservationCategory,
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
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <Input
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md w-full"
          type="search"
        />

        <div className="flex gap-2 flex-wrap justify-end items-center">
          {/* Export Button */}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onExport}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            Export
          </Button>

          {/* New Application Button */}
          <Button
            className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle className="h-5 w-5" />
            New Application
          </Button>
        </div>
      </div>

     {/* Table Container */}
<div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
  <Table className="min-w-full table-auto">
    {/* Header */}
 <TableHeader className="bg-primary sticky top-0 z-10 shadow-md">
  <TableRow>
    {[
      "No.", "Full Name", "Caste", "Religion", "Category", "Distance (km)",
      "Mark", "Phone", "Priority 1", "Priority 2", "Priority 3", "LET Reg No", "LET Rank", "Actions"
    ].map((title, i) => (
      <TableHead
        key={i}
        className={`px-4 py-3.5 text-left text-sm font-bold text-white uppercase tracking-wider border-r border-indigo-400/50 ${
          title === "Actions" ? "text-right border-r-0 pr-6" : ""
        }`}
      >
        {title}
      </TableHead>
    ))}
  </TableRow>
</TableHeader> 

    {/* Body */}
    <TableBody className="divide-y divide-gray-100 bg-white text-gray-800 text-sm">
      {filteredApps.length === 0 && (
        <TableRow>
          <TableCell colSpan={16} className="text-center py-6 text-gray-400">
            No applications found.
          </TableCell>
        </TableRow>
      )}

      {filteredApps.map((app, index) => (
        <TableRow
  key={app.id}
  className="hover:bg-indigo-50 even:bg-gray-50 transition-colors duration-200"
>
  {/* All cells except last have right border */}
  <TableCell className="px-4 py-3 font-medium border-r border-gray-200">
    {index + 1}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.name}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.caste}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.religion}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.reservationCategory}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.distance}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.mark}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.phone}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.priorityChoices?.[1]}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.priorityChoices?.[2]}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.priorityChoices?.[3]}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.letRegNo}
  </TableCell>
  <TableCell className="px-4 py-3 border-r border-gray-200">
    {app.letRank}
  </TableCell>
  
  {/* Last cell (Actions) has no right border */}
  <TableCell className="px-4 py-3 text-right">
    <div className="flex justify-end items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="hover:bg-indigo-100 transition-colors duration-200"
        onClick={() => onEdit(app)}
        aria-label={`Edit ${app.name}`}
      >
        <Pencil className="w-4 h-4 text-indigo-600" />
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleDelete(app.id)}
        aria-label={`Delete ${app.name}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  </TableCell>
</TableRow>
      ))}
    </TableBody>
  </Table>
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
