import { useEffect, useRef } from "react";
import { Info, Users } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export default function HelpCenter() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const branches = ["Civil Engineering (CE)", "Electrical and Electronics Engineering(EEE)", "Mechanical Engineering (ME)"];

  const commonReservation = {
    "State Merit": "50%",
    "EWS": "10%",
    "SEBC":"30%",
    "Ezhava": "9%",
    "Muslim": "8%",
    "Other Backward Hindu": "3%",
    "Latin Catholic and Anglo Indian": "3%",
    "Dheevara": "2%",
    "Viswakarma": "2%",
    "Kusavan": "1%",
    "OBC Christian": "1%",
    "Kudumbi": "1%",
    "Scheduled Caste": "8%",
    "Scheduled Tribe": "2%",
    "PD (Physically Disabled)": "5% (min. of 40% disability)",
    "Transgender": "1 seat",
    "Sports Quota": "1 seat",
    "DTE Staff": "1 seat",
    "Central Govt. Employee": "1 seat",
  };

  const faqs = [
    {
      question: "How are seats allocated in the BTech Working Professionals programme?",
      answer:
        "Seats are allocated based on LET rank list published by LBS Centre for Science and Technology and reservation norms of Government of Kerala.",
    },
    {
      question: "Is there any management quota in BTech Working Professionals programme?",
      answer:
        "No, CET follows strict merit-based admission for all seats in the BTech Working Professionals programme.",
    },
    {
      question: "Can I apply for multiple branches?",
      answer:
        "Yes, you can indicate branch preferences in your application form.",
    },
    {
      question: "What's the duration of the BTech Working Professionals programme?",
      answer:
        "The BTech Working Professionals programme duration is 3 years (6 semesters).",
    },
    {
      question: "What's the time of conduct of classes for BTech Working Professionals programme?",
      answer:
        "All classes including theory and practicals will be conducted from 5.45 pm to 9.15 pm on all weekdays. On weekends extra classes may be arranged by students as per the convenience of students and teachers.",
    }
  ];

  return (
    <div ref={containerRef} className="relative overflow-hidden min-h-screen bg-white">
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10"
        style={{ y }}
      />

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Help Center</h1>
          <p className="text-lg text-gray-600">College of Engineering Trivandrum (CET)</p>
        </motion.div>

        {/* Branch List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <Card className="border border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <Users className="h-6 w-6" />
                Departments Offering BTech for working professionals.
              </CardTitle>
              <CardDescription>All departments follow the same seat structure</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {branches.map((branch, idx) => (
                  <li key={idx}>{branch}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Common Reservation Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <Card className="border border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <Users className="h-6 w-6" />
                Reservation-Based Seat Distribution
              </CardTitle>
              <CardDescription>Total Intake per Branch: 30 Seats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                {Object.entries(commonReservation).map(([category, seats]) => (
                  <div key={category} className="flex justify-between border-b py-1">
                    <span className="text-gray-700">{category}</span>
                    <span className="font-medium text-right">{seats}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-semibold text-primary flex items-center gap-2 mb-6">
            <Info className="h-6 w-6" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-base font-medium">
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
