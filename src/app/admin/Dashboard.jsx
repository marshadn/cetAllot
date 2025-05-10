import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DashboardHeader } from "./DashboardHeader";
import { ApplicationTable } from "./ApplicationTable";
import { NoticeCards } from "./NoticeCards";
import { NoticeDialog } from "./NoticeDialog";
import { AllotmentDialog } from "./AllotmentDialog";
import { AllotmentResults } from "./Allotment/AllotmentResults";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const [isAppDialogOpen, setAppDialogOpen] = useState(false);
  const [isNoticeDialogOpen, setNoticeDialogOpen] = useState(false);
  const [isAllotmentDialogOpen, setAllotmentDialogOpen] = useState(false);

  const [editAppData, setEditAppData] = useState(null);
  const [editNoticeData, setEditNoticeData] = useState(null);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const applicationsSnapshot = await getDocs(collection(db, "applications"));
        const noticesSnapshot = await getDocs(collection(db, "notices"));
        const allotmentSnapshot = await getDocs(collection(db, "allotment"));

        const applicationsData = applicationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const noticesData = noticesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const allotmentData = allotmentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setApplications(applicationsData);
        setNotices(noticesData);
        setDepartments(allotmentData);  // Assuming the data includes department details
      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    navigate("/login");
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader
        onNewNotice={() => {
          setEditNoticeData({
            title: "",
            message: "",
            date: new Date().toISOString().split("T")[0],
            important: false,
          });
          setNoticeDialogOpen(true);
        }}
        onPublishAllotments={() => setAllotmentDialogOpen(true)}
        onLogout={handleLogout}
      />

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="allotment">Allotment</TabsTrigger>
          <TabsTrigger value="notices">Notices & Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <ApplicationTable
            applications={filteredApplications}
            departments={departments}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            isLoading={isLoading}
            onEdit={() => {}} // Placeholder
            onNewApplication={() => {}} // Placeholder
          />
        </TabsContent>

        <TabsContent value="allotment">
          <AllotmentResults />
        </TabsContent>

        <TabsContent value="notices">
          <NoticeCards
            notices={notices}
            onEdit={() => {}} // Placeholder
            onDelete={() => {}} // Placeholder
            onNewNotice={() => {
              setEditNoticeData({
                title: "",
                message: "",
                date: new Date().toISOString().split("T")[0],
                important: false,
              });
              setNoticeDialogOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <NoticeDialog
        open={isNoticeDialogOpen}
        onOpenChange={setNoticeDialogOpen}
        notice={editNoticeData}
        onSave={() => {}} // Placeholder
        onChange={setEditNoticeData}
        isLoading={isLoading}
      />

      <AllotmentDialog
        open={isAllotmentDialogOpen}
        onOpenChange={setAllotmentDialogOpen}
        departments={departments}
        applications={applications}
        onPublish={() => {}} // Placeholder
        isLoading={isLoading}
      />
    </div>
  );
}
