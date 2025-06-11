import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Clock, Briefcase, FileText, Users, Calendar,
  Building, Aperture, BookOpen, CheckCircle, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion, useScroll, useTransform } from "framer-motion";


import { db } from "@/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import AllottedTable from "./admin/Allotment/AllottedTable";
export default function PartTimeBtech() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  // const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.2]);

  const [isPublished, setIsPublished] = useState(false);
  const [allottedData, setAllottedData] = useState({ ce: [], ee: [], mech: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if published
        const publishSnap = await getDoc(doc(db, "allotment", "publishStatus"));
        const published = publishSnap.exists() && publishSnap.data().published;
        setIsPublished(published);

        // If not published, skip fetching
        if (!published) return;

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
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Existing UI */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            Admission Results
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
           View your admission status for the B.Tech Program at College of Engineering Trivandrum 
          </motion.p>
        </motion.div>


        {loading ? (
  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
  <svg
    className="animate-spin h-8 w-8 text-primary mb-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
  <p className="text-lg font-medium">Loading result status...</p>
  <p className="text-sm text-muted-foreground mt-1">Please wait while we fetch the latest updates.</p>
</div>

) : isPublished ? (
  <div className="space-y-8">
    <AllottedTable students={allottedData.ce} deptName="Civil Engineering" />
    <AllottedTable students={allottedData.ee} deptName="Electrical & Electronics Engineering" />
    <AllottedTable students={allottedData.mech} deptName="Mechanical Engineering" />
  </div>
) : (
  <div className="text-center py-12">
    <h3 className="text-2xl font-semibold mb-4">Results Not Yet Published</h3>
    <p className="text-muted-foreground text-lg">
      The admission results will be published soon. Please check back later.
    </p>
  </div>
)}
{/* Program Highlights */}
<motion.div
  style={{ y }} // Only y, no opacity
  className="relative bg-gradient-to-br from-primary/10 to-blue-900/10 rounded-3xl p-8 mb-16 overflow-hidden"
>
  <div className="relative z-10">
    <h2 className="text-2xl font-bold mb-8 text-center">
      Program Highlights
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        {
          title: "Working Professionals",
          description:
            "Designed for employed individuals with diploma qualifications",
          icon: <Briefcase className="h-10 w-10 text-primary" />,
        },
        {
          title: "Evening Classes",
          description:
            "6:00 PM to 9:00 PM on weekdays + Saturday sessions",
          icon: <Clock className="h-10 w-10 text-primary" />,
        },
        {
          title: "Duration",
          description:
            "4-year program (8 semesters) following Kerala University syllabus",
          icon: <Calendar className="h-10 w-10 text-primary" />,
        },
        {
          title: "Eligibility",
          description:
            "Currently No such Eligibility Criteria has to be mentioned",
          icon: <BookOpen className="h-10 w-10 text-primary" />,
        },
        {
          title: "Specializations",
          description:
            "Electronics, Mechanical and Civil Engineering",
          icon: <Aperture className="h-10 w-10 text-primary" />,
        },
        {
          title: "Approval",
          description: "Approved by AICTE and Kerala University",
          icon: <Building className="h-10 w-10 text-primary" />,
        },
      ].map((item, index) => (
        <motion.div
          key={index}
          initial={{ y: 50 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.15 }}
        >
          <Card className="transition-all hover:shadow-md h-full">
            <CardHeader>
              <motion.div
                className="mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring" }}
              >
                {item.icon}
              </motion.div>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
  <div className="absolute inset-0 bg-white/30 z-0" />
</motion.div>

        

        {/* CTA */}
        <motion.div
          className="text-center mt-68"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-4">
            Next Steps for Your Engineering Journey
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Selected candidates should complete the admission formalities to secure their seat in CET's prestigious part-time B.Tech program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/help-desk">
              <Button size="lg" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Admission Help Desk
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
