import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { calculateAllotment } from "./calculateAllotment";
import { db } from "@/firebase";

// Helper function to clear previous allotment
const clearPreviousAllotment = async (department) => {
  const snapshot = await getDocs(collection(db, `allotment/${department}/students`));
  const deletions = snapshot.docs.map((docSnap) =>
    deleteDoc(doc(db, `allotment/${department}/students`, docSnap.id))
  );
  await Promise.all(deletions);
  // console.log(`🗑️ Cleared previous data in allotment/${department}/students`);
};

const clearPreviousAllotment2 = async (department) => {
  const snapshot = await getDocs(collection(db, `no_exam_allotment/${department}/students`));
  const deletions = snapshot.docs.map((docSnap) =>
    deleteDoc(doc(db, `no_exam_allotment/${department}/students`, docSnap.id))
  );
  await Promise.all(deletions);
  // console.log(`🗑️ Cleared previous data in allotment/${department}/students`);
};

export const runAllotmentHandler = async () => {
  try {
    // console.log("📥 Fetching applications from Firestore...");
    const applicationsSnapshot = await getDocs(collection(db, "applications"));
    const applications = applicationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // console.log("✅ Total applications fetched:", applications.length);
    // console.log("📘 Sample Application:", applications[0]);

    // console.log("⚙️ Running calculateAllotment...");
    const departments = [
  {
    "name": "Electrical and Electronics Engineering",
    "totalSeats": 30
  },
  {
    "name": "Mechanical Engineering",
    "totalSeats": 30
  },
  {
    "name": "Civil Engineering",
    "totalSeats":30
},
  {
    "name": "Waiting List",
    "totalSeats":100
}
]
    const { updatedApplications, updatedDepartments,noExamApplications } = calculateAllotment(applications, departments);
    const noApplication = calculateAllotment(noExamApplications, departments)["updatedApplications"];
    
    // console.log("🧮 Allotment completed. Departments:", updatedDepartments);

    // 🔄 Clear old data before inserting new ones
    for (const dept of updatedDepartments) {
      await clearPreviousAllotment(dept.name);
      await clearPreviousAllotment2(dept.name);
    }

    // ✅ Write new allotment results
    for (const dept of updatedDepartments) {
      const studentsInDept = updatedApplications.filter(
        (app) => app.allottedDepartment === dept.name
      );
      // console.log(`📤 Uploading ${studentsInDept.length} students to dept: ${dept.name}`);

      for (const student of studentsInDept) {
        await setDoc(
          doc(db, "allotment", dept.name, "students", student.id),
          student
        );
        // console.log(`✅ Written to allotment/${dept.name}/students/${student.id}`);
      }
    }

    for (const dept of updatedDepartments) {
      const studentsInDept = noApplication.filter(
        (app) => app.allottedDepartment === dept.name
      );
      // console.log(`📤 Uploading ${studentsInDept.length} students to dept: ${dept.name}`);

      for (const student of studentsInDept) {
        await setDoc(
          doc(db, "no_exam_allotment", dept.name, "students", student.id),
          student
        );
        // console.log(`✅ Written to allotment/${dept.name}/students/${student.id}`);
      }
    }

    // console.log("✅ Allotment data written successfully.");
    return { success: true };
  } catch (error) {
    // console.error("❌ Allotment error:", error);
    return { success: false, error };
  }
};
