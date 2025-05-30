import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import AllottedTable from "./AllottedTable";

export const AllotmentResults = () => {
  const [allottedData, setAllottedData] = useState({ ce: [], ee: [], mech: [] });
  const [loading, setLoading] = useState(true);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const fetchAllottedStudents = async () => {
      try {
        const departments = ["ce", "ee", "mech"];
        const data = { ce: [], ee: [], mech: [] };

        for (const dept of departments) {
          const snapshot = await getDocs(collection(db, `allotment/${dept}/students`));
          const students = [];

          snapshot.forEach((doc) => {
            const student = { id: doc.id, ...doc.data() };
            students.push(student);
          });

          students.sort((a, b) => {
            const rankA = Number(a.letRank);
            const rankB = Number(b.letRank);

            if (isNaN(rankA)) return 1;
            if (isNaN(rankB)) return -1;
            return rankA - rankB;
          });

          data[dept] = students;
        }

        setAllottedData(data);
      } catch (error) {
        console.error("Error fetching allotted students:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPublishStatus = async () => {
      try {
        const docRef = doc(db, "allotment", "publishStatus");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsPublished(!!docSnap.data().published);
        }
      } catch (error) {
        console.error("Error fetching publish status:", error);
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
      console.error("Error updating publish status:", error);
      alert("Failed to update publish status.");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground text-sm py-10">
        Loading allotted students...
      </div>
    );
  }

  if (
    allottedData.ce.length === 0 &&
    allottedData.ee.length === 0 &&
    allottedData.mech.length === 0
  ) {
    return (
      <div className="text-center text-muted-foreground text-sm py-10">
        No students allotted yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-4">
        <button
          onClick={togglePublish}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isPublished ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isPublished ? "Unpublish Allotment" : "Publish Allotment"}
        </button>
      </div>

      <AllottedTable students={allottedData.ce} deptName="CE" />
      <AllottedTable students={allottedData.ee} deptName="EE" />
      <AllottedTable students={allottedData.mech} deptName="MECH" />
    </div>
  );
};
