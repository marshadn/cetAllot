import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export const AllotmentResults = () => {
  const [allottedData, setAllottedData] = useState({
    me: [],
    ee: [],
    mech: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllottedStudents = async () => {
      try {
        const departments = ["me", "ee", "mech"];
        const data = { me: [], ee: [], mech: [] };

        for (const dept of departments) {
          const snapshot = await getDocs(collection(db, `allotment/${dept}/students`));
          snapshot.forEach((doc) => {
            data[dept].push({
              id: doc.id,
              ...doc.data(),
            });
          });
        }

        setAllottedData(data);
      } catch (error) {
        console.error("Error fetching allotted students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllottedStudents();
  }, []);

  const renderTable = (students, deptName) => {
    if (students.length === 0) return null;

    return (
      <div className="border rounded-lg shadow-sm bg-white p-5 space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">{deptName} - Allotted Students</h2>
        <div className="overflow-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-4 py-2">#</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">LET Rank</th>
                <th className="border px-4 py-2">Category</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2 font-medium">{student.name}</td>
                  <td className="border px-4 py-2">{student.email}</td>
                  <td className="border px-4 py-2">{student.letRank || "-"}</td>
                  <td className="border px-4 py-2">{student.category || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground text-sm py-10">
        Loading allotted students...
      </div>
    );
  }

  if (
    allottedData.me.length === 0 &&
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
      {renderTable(allottedData.me, "ME")}
      {renderTable(allottedData.ee, "EE")}
      {renderTable(allottedData.mech, "MECH")}
    </div>
  );
};
