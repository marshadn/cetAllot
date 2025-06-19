import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "../components/ui/Button";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

// Add CSS for hiding scrollbars
const scrollbarStyles = `
  .hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

const baseNavigation = [
  { name: "Home", href: "/" },
  // { name: "About", href: "/about" },
  // { name: "Programs", href: "/programs" },
  { name: "Admission", href: "/admission" },
  // { name: "Eligibility", href: "/eligibility" },
  { name: "Help", href: "/help" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [user, setUser] = useState(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const navigation = user
    ? [...baseNavigation, { name: "Dashboard", href: "/admin/dashboard" }]
    : baseNavigation;

  // Track Firebase auth user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // Scrollbar style
  useEffect(() => {
    if (!document.getElementById("hide-scrollbar-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "hide-scrollbar-styles";
      styleElement.innerHTML = scrollbarStyles;
      document.head.appendChild(styleElement);
    }
    document.body.classList.add("hide-scrollbar");
  }, []);

  // Hide navbar on scroll down
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setIsAtTop(window.scrollY === 0);
          lastScrollY.current = window.scrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    setIsAtTop(window.scrollY === 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header
        className={`bg-background sticky top-0 z-40 transition-transform duration-300 ${
          isAtTop ? "translate-y-0" : "-translate-y-full"
        } ${mobileMenuOpen ? "hidden lg:block" : ""}`}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2 group">
  <div className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 transition-all group-hover:scale-105">
    <img
      src="/logo.png"
      alt="EduAllot Logo"
      className="h-6 w-6 object-contain"
    />
  </div>
  <div className="flex flex-col leading-tight">
    <span className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
      Edu<span className="text-primary">Allot</span>
    </span>
    <span className="text-xs text-muted-foreground tracking-wide">
      B.Tech Admission Portal
    </span>
  </div>
</Link>

          </div>

          {/* Mobile menu icon */}
          <div className="flex lg:hidden">
            <Button
              variant="ghost"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative text-sm font-semibold leading-6 transition-all duration-200 
                after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 
                after:bg-primary after:transition-all after:duration-300 hover:after:w-full
                ${
                  pathname === item.href
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop buttons */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-4">
            <Link to="/apply">
              <Button>Apply Now</Button>
            </Link>
            {user ? (
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Link to="/admin">
                <Button variant="outline">Admin Login</Button>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background hide-scrollbar">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2 group">
  <div className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 transition-all group-hover:scale-105">
    <img
      src="/logo.png"
      alt="EduAllot Logo"
      className="h-6 w-6 object-contain"
    />
  </div>
  <div className="flex flex-col leading-tight">
    <span className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
      Edu<span className="text-primary">Allot</span>
    </span>
    <span className="text-xs text-muted-foreground tracking-wide">
      B.Tech Admission Portal
    </span>
  </div>
</Link>
              <Button
                variant="ghost"
                className="-m-2.5 rounded-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Mobile links */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block py-3 text-base font-semibold leading-7 ${
                      pathname === item.href
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile footer buttons */}
              <div className="mt-8 flex flex-col gap-4">
                <Link to="/apply" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Apply Now</Button>
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Admin Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
