import React from "react";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./app/Home";
import Admission from "./app/Admission";
import NotFound from "./app/NotFound"; 
import HelpDesk from "./app/HelpDesk";


import Apply from "./app/Apply";
import Login from "./app/admin/Login";
import Dashboard from "./app/admin/Dashboard";
import Contact from "./app/Contact";
import Help from "./app/Help";
import { Toaster } from "sonner"; 

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/admin" />;
};

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/about" element={<About />} /> */}
        {/* <Route path="/programs" element={<Programs />} /> */}
        <Route path="/admission" element={<Admission />} />
        {/* <Route path="/eligibility" element={<Eligibility />} /> */}
        <Route path="/apply" element={<Apply />} />

        <Route path="/admin" element={<Login />} />
        {/* <Route path="/admin/dashboard" element={<Dashboard />} /> */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/help-desk" element={<HelpDesk />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
          <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      
      <Toaster richColors position="top-right" />
    </>
  );
};

export default App;
