import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "./Sidebar";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/50">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden glass border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setSidebarOpen(true)}
                variant="ghost"
                size="sm"
                icon="Menu"
              />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <ApperIcon name="Mic" size={16} className="text-white" />
                </div>
                <span className="font-bold text-gradient">VoiceVault AI</span>
              </div>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </div>

          {/* Main Content */}
          <main className="p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      />
    </div>
  );
};

export default Layout;