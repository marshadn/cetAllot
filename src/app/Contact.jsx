"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const CONTACT_INFO = {
  address: {
    name: "College of Engineering Trivandrum",
    lines: [
      "Engineering College P.O.",
      "Sreekaryam",
      "Thiruvananthapuram - 695016",
      "Kerala, India",
    ],
  },
  phone: [
    { label: "Main Office", number: "+91 471 299 8391" },
    { label: "Binu S", number: "+91 94952 07212" },
    { label: "Anas S", number: "+91 96336 33094" },
    { label: "Prathibha P G", number: "+91 94472 47959" },
    { label: "Ratheesh Kumar K", number: "+91 70255 70025" },
  ],
  email: [
    { label: "General Inquiries", address: "hodptdc@cet.ac.in" },
    { label: "Admissions", address: "cetptdc@gmail.com" },
  ],
  hours: [
    { day: "Monday - Saturday", time: "2:00 PM - 5:00 PM" },
  ],
};

export default function Contact() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" ref={containerRef}>
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background -z-10"
        style={{ y, opacity }}
      />

      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground">
            Office of The Evening Degree Programmes.
          </p>
        </motion.div>

        {/* Contact Info Card */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Contact Information</CardTitle>
                <CardDescription>
                  Reach out to us through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address */}
                <motion.div className="flex items-start gap-4 group" whileHover={{ x: 5 }}>
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-muted-foreground">
                      {"Department of Evening Degree Programmes"}
                      <br />
                      {CONTACT_INFO.address.name}
                      <br />
                      {CONTACT_INFO.address.lines.map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </p>
                  </div>
                </motion.div>

                {/* Phone */}
                <motion.div className="flex items-start gap-4 group" whileHover={{ x: 5 }}>
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">
                      {CONTACT_INFO.phone.map((phone, i) => (
                        <span key={i}>
                          {phone.label}: {phone.number}
                          <br />
                        </span>
                      ))}
                    </p>
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div className="flex items-start gap-4 group" whileHover={{ x: 5 }}>
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">
                      {CONTACT_INFO.email.map((email, i) => (
                        <span key={i}>
                          {email.label}:{" "}
                          <a href={`mailto:${email.address}`} className="hover:underline">
                            {email.address}
                          </a>
                          <br />
                        </span>
                      ))}
                    </p>
                  </div>
                </motion.div>

                {/* Office Hours */}
                <motion.div className="flex items-start gap-4 group" whileHover={{ x: 5 }}>
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Office Hours</h3>
                    <p className="text-muted-foreground">
                      {CONTACT_INFO.hours.map((hour, i) => (
                        <span key={i}>
                          {hour.day}: {hour.time}
                          <br />
                        </span>
                      ))}
                    </p>
                    <p className="text-muted-foreground">
                      Closed on all holidays allowed by Govt. of Kerala
                    </p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
