import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { calculateAllotment } from "./calculateAllotment";
import { db } from "@/firebase";

export const runAllotmentHandler = async () => {
  try {
    console.log("📥 Fetching applications from Firestore...");
    const applicationsSnapshot = await getDocs(collection(db, "applications"));
    const applications = applicationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("✅ Total applications fetched:", applications.length);
    console.log("📘 Sample Application:", applications[0]);

    console.log("⚙️ Running calculateAllotment...");
    const departments = [
      { name: "me", totalSeats: 10 },
      { name: "ee", totalSeats: 10 },
      { name: "mech", totalSeats: 10 },
    ];
    const { updatedApplications, updatedDepartments } = calculateAllotment(applications, departments);

    console.log("🧮 Allotment completed. Departments:", updatedDepartments);

    for (const dept of updatedDepartments) {
      const studentsInDept = updatedApplications.filter(
        (app) => app.allottedDepartment === dept.name
      );
      console.log(`📤 Uploading ${studentsInDept.length} students to dept: ${dept.name}`);

      for (const student of studentsInDept) {
        await setDoc(
          doc(db, "allotment", dept.name, "students", student.id),
          student
        );
        console.log(`✅ Written to allotment/${dept.name}/students/${student.id}`);
      }
    }

    console.log("✅ Allotment data written successfully.");
    return { success: true };
  } catch (error) {
    console.error("❌ Allotment error:", error);
    return { success: false, error };
  }
};
