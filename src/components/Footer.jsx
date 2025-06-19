import React, { useState } from "react";
import { Facebook, Instagram, Linkedin, Twitter, X, Mail, Github } from "lucide-react";

export default function Footer() {
  const [showModal, setShowModal] = useState(false);

  const developers = [
    {
      name: "Suneeb S",
      email: "suneebsunilkumar12@gmail.com",
      github: "https://github.com/suneebs",
      linkedin: "https://www.linkedin.com/in/suneeb-s12/",
      instagram: "https://www.instagram.com/_think_different___",
    },
    {
      name: "Muhamed Marshad",
      email: "muhamedmarshad18@gmail.com",
      github: "http://github.com/marshadn",
      linkedin: "http://linkedin.com/in/marshadn",
      instagram: "http://instagram.com/marshxadn",
    },
    {
      name: "Yadhu Krishna",
      email: "yadhukrishnx@gmail.com",
      github: "https://github.com/yadhukrishnx",
      linkedin: "https://www.linkedin.com/in/yadhukrishnx/",
      instagram: "https://www.instagram.com/yadhukrishnx/",
    },
  ];

  return (
    <>
      <footer className="bg-muted">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="https://www.facebook.com/CollegeOfEngineeringTrivandrum/" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://www.instagram.com/cetians_/" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Instagram</span>
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://x.com/cet_trivandrum" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://in.linkedin.com/school/college-of-engineering-trivandrum/" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-muted-foreground">
              &copy; {new Date().getFullYear()} College of Engineering Trivandrum. All rights reserved.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
          <div className="border-t border-muted-foreground/10 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              {/* <a href="/privacy-policy" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                Terms of Service
              </a> */}
              <button
                onClick={() => setShowModal(true)}
                className="text-sm leading-6 text-muted-foreground hover:text-foreground"
              >
                Contact
              </button>
            </div>
            <p className="mt-8 text-xs leading-5 text-muted-foreground md:order-1 md:mt-0">
              Designed and Developed by CET MCA Department
            </p>
          </div>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 border border-muted p-5 rounded-lg w-[90%] max-w-sm shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-foreground mb-4">Developer Contacts</h2>
            <div className="space-y-4 text-sm">
              {developers.map((dev, index) => (
                <div key={index} className="border-t pt-3 first:border-none first:pt-0">
                  <p className="font-medium text-foreground mb-1">{dev.name}</p>
                  <div className="flex space-x-4 items-center">
                    <a href={`mailto:${dev.email}`} className="hover:text-foreground" aria-label="Email">
                      <Mail className="h-4 w-4" />
                    </a>
                    <a href={dev.github} target="_blank" rel="noopener noreferrer" className="hover:text-foreground" aria-label="GitHub">
                      <Github className="h-4 w-4" />
                    </a>
                    <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-foreground" aria-label="LinkedIn">
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a href={dev.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-foreground" aria-label="Instagram">
                      <Instagram className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
