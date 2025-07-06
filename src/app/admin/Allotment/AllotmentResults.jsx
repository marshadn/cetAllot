import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import AllottedTable from "./AllottedTable";
import AllottedNoTable from "./AllottedNoTable";
import * as XLSX from "xlsx";
import { Download, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { distance } from "framer-motion";

export const AllotmentResults = () => {
  const [allottedData, setAllottedData] = useState({ ce: [], ee: [], mech: [] });
  const [allottedData2, setAllottedData2] = useState({ ce: [], ee: [], mech: [] });
  const [loading, setLoading] = useState(true);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const fetchAllottedStudents = async () => {
      try {
        const departments = ["Civil Engineering", "Electrical and Electronics Engineering", "Mechanical Engineering","Waiting List"];
        const data = { ce: [], ee: [], mech: [] };
        const data2 = { ce: [], ee: [], mech: [] };

        for (const dept of departments) {
          const snapshot = await getDocs(collection(db, `allotment/${dept}/students`));
          const snapshot2 = await getDocs(collection(db, `no_exam_allotment/${dept}/students`));
          // console.log(snapshot);
          
          const students = [];
          const students2 = [];

          snapshot.forEach((doc) => {
            const student = { id: doc.id, ...doc.data() };
           
            students.push(student);
          });

          snapshot2.forEach((doc) => {
            const student = { id: doc.id, ...doc.data() };
           
            students2.push(student);
          });

          students.sort((a, b) => {
            const rankA = Number(a.letRank);
            const rankB = Number(b.letRank);
            if (isNaN(rankA)) return 1;
            if (isNaN(rankB)) return -1;
            return rankA - rankB;
          });

          students2.sort((a, b) => {
            const rankA = Number(a.letRank);
            const rankB = Number(b.letRank);
            if (isNaN(rankA)) return 1;
            if (isNaN(rankB)) return -1;
            return rankA - rankB;
          });

          data[dept] = students;
          data2[dept] = students2;
        }

        setAllottedData(data);
        setAllottedData2(data2);
      } catch (error) {
        // console.error("Error fetching allotted students:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPublishStatus = async () => {
      try {
        const docRef = doc(db, "allotment", "publishStatus");
        const docRef2 = doc(db, "no_exam_allotment", "publishStatus");
        const docSnap = await getDoc(docRef);
        const docSnap2 = await getDoc(docRef2);
        if (docSnap.exists()) {
          setIsPublished(!!docSnap.data().published);
        }
        if (docSnap2.exists()) {
          setIsPublished(!!docSnap2.data().published);
        }
      } catch (error) {
        // console.error("Error fetching publish status:", error);
      }

    };

    fetchAllottedStudents();
    fetchPublishStatus();
  }, []);

  const togglePublish = async () => {
    try {
      const newStatus = !isPublished;
      await setDoc(doc(db, "allotment", "publishStatus"), {
        published: newStatus,
        timestamp: new Date().toISOString(),
      });
      setIsPublished(newStatus);
      alert(`Allotment ${newStatus ? "published" : "unpublished"} successfully.`);
    } catch (error) {
      // console.error("Error updating publish status:", error);
      alert("Failed to update publish status.");
    }

    try {
      const newStatus = !isPublished;
      await setDoc(doc(db, "no_exam_allotment", "publishStatus"), {
        published: newStatus,
        timestamp: new Date().toISOString(),
      });
      setIsPublished(newStatus);
      // alert(`Allotment ${newStatus ? "published" : "unpublished"} successfully.`);
    } catch (error) {
      // console.error("Error updating publish status:", error);
      alert("Failed to update publish status.");
    }
  };

  const exportToExcel = () => {
  const workbook = XLSX.utils.book_new();

  // Define education priority order (same as in AllottedTable)
  const educationOrder = {
    'BE': 1,
    'BTech': 1,
    'Diploma': 2,
    'BSc': 3,
    'BVoc': 4
  };

  const sortStudents = (students) => {
    return [...students].sort((a, b) => {
      // Get education priorities (default to 999 for unknown education types)
      const eduPriorityA = educationOrder[a.education] || 999;
      const eduPriorityB = educationOrder[b.education] || 999;

      // First sort by education priority
      if (eduPriorityA !== eduPriorityB) {
        return eduPriorityA - eduPriorityB;
      }

      // If education is the same, sort by rank
      const rankA = parseFloat(a.letRank ?? Infinity);
      const rankB = parseFloat(b.letRank ?? Infinity);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      // If rank is also the same, sort by marks (assuming higher marks = better)
      const marksA = parseFloat(a.mark ?? 0);
      const marksB = parseFloat(b.mark ?? 0);

      return marksB - marksA;
    });
  };

  const appendWithDept = (students, deptLabel) => {
    const sortedStudents = sortStudents(students);
    const sheetData = sortedStudents.map((student, index) => ({
      SlNo: index + 1,
      Name: student.name,
      LET_Rank: student.letRank,
      Reservation_Category: student.allottedCategory,
      Address: student.address,
      Aadhar: student.adharNumber,
      Age: student.age,
      Caste: student.caste,
      Category: student.category,
      Company: student.company,
      Distance: student.distance,
      Email: student.email,
      Experience: student.experience,
      Education: student.education,
      LET_Reg: student.letRegNo,
      Mark: student.mark,
      Phone: student.phone,
      Priority_1: student.priorityChoices?.[1],
      Priority_2: student.priorityChoices?.[2],
      Priority_3: student.priorityChoices?.[3],
      Religion: student.religion,
      Department: deptLabel
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, deptLabel);
  };

  appendWithDept(allottedData['Civil Engineering'], "Civil Engineering");
  appendWithDept(allottedData['Electrical and Electronics Engineering'], "Electrical Engineering");
  appendWithDept(allottedData['Mechanical Engineering'], "Mechanical Engineering");
  appendWithDept(allottedData['Waiting List'], "Waiting List");

  appendWithDept(allottedData2['Civil Engineering'], "NO EXAM Civil Engineering");
  appendWithDept(allottedData2['Electrical and Electronics Engineering'], "NO EXAM Electrical Engineering");
  appendWithDept(allottedData2['Mechanical Engineering'], "NO EXAM Mechanical Engineering");
  appendWithDept(allottedData2['Waiting List'], "NO EXAM Waiting List");
  
  XLSX.writeFile(workbook, "Allotment_Results.xlsx");
};


  if (loading) {
    return (
      <div className="text-center text-muted-foreground text-sm py-10">
        Loading allotted students...
      </div>
    );
  }

  if (
    allottedData['Civil Engineering'].length === 0 &&
    allottedData['Electrical and Electronics Engineering'].length === 0 &&
    allottedData['Mechanical Engineering'].length === 0
  ) {
    return (
      <div className="text-center text-muted-foreground text-sm py-10">
        No students allotted yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between mb-4">
        <Button
          onClick={exportToExcel}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-5 w-5" />
          Export
        </Button>

        <Button
          onClick={togglePublish}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isPublished ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isPublished ? "Unpublish Allotment" : "Publish Allotment"}
        </Button>
      </div>

      <AllottedTable students={allottedData['Civil Engineering']} deptName="Civil Engineering" />
      <AllottedTable students={allottedData['Electrical and Electronics Engineering']} deptName="Electrical & Electronics Engineering" />
      <AllottedTable students={allottedData['Mechanical Engineering']} deptName="Mechanical Engineering" />
      <AllottedTable students={allottedData['Waiting List']} deptName="Waiting List" />

      <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-700 uppercase tracking-wide border-b-4 border-blue-700 pb-2 mt-32">
  Allotment Results: Non-LET Candidates
</h2>


      <AllottedNoTable students={allottedData2['Civil Engineering']} deptName="Civil Engineering" />
      <AllottedNoTable students={allottedData2['Electrical and Electronics Engineering']} deptName="Electrical & Electronics Engineering" />
      <AllottedNoTable students={allottedData2['Mechanical Engineering']} deptName="Mechanical Engineering" />
      <AllottedNoTable students={allottedData2['Waiting List']} deptName="Waiting List" />
  </div>
);
};