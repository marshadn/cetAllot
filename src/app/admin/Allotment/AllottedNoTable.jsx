import React from "react";

const RESERVED_CATEGORIES = [
  "EWS", "Ezhava", "Muslim", "Other Backward Hindu", "Latin Catholic and Anglo Indian",
  "Dheevara", "Viswakarma", "Kusavan", "OBC Christian", "Kudumbi",
  "SC", "ST", "Physically Disabled", "Transgender", "Sports", "DTE Staff", "Central govt. employee"
];

const AllottedNoTable = ({ students, deptName }) => {
  if (!students || students.length === 0) return null;

  const educationOrder = {
    BE: 1,
    BTech: 1,
    Diploma: 2,
    BSc: 3,
    BVoc: 4,
  };

  const isReserved = (category) => RESERVED_CATEGORIES.includes(category);

  const reservedStudents = students.filter((s) => isReserved(s.reservationCategory));
  const generalStudents = students.filter((s) => s.reservationCategory === "General");

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

  const sortedStudents = [...sortStudents(reservedStudents), ...sortStudents(generalStudents)];

  return (
    <div className="backdrop-blur-sm bg-white/80 border border-gray-200 rounded-3xl shadow-xl p-6 transition-all duration-300">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
        {deptName} <span className="text-gray-500 text-lg font-medium">— Non LET Allotted Students</span>
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-primary text-white uppercase text-xs tracking-widest">
            <tr>
              <th className="px-3 py-3 rounded-tl-2xl border-r border-white/30">No.</th>
              <th className="px-3 py-3 border-r border-white/30">Name</th>
              <th className="px-3 py-3 border-r border-white/30">Education</th>
              <th className="px-3 py-3 border-r border-white/30">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedStudents.map((student, index) => (
              <tr
                key={student.id}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="px-3 py-3 font-medium text-gray-800 border-r border-gray-200/50 whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="px-3 py-3 border-r border-gray-200/50 whitespace-nowrap">
                  {student.name}
                </td>
                <td className="px-3 py-3 border-r border-gray-200/50 whitespace-nowrap">
                  {student.education || "-"}
                </td>
                <td className="px-3 py-3 border-r border-gray-200/50 whitespace-nowrap">
                  {student.reservationCategory || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllottedNoTable;
