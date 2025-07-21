import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Recordings", href: "/", icon: "Mic" },
    { name: "Search", href: "/search", icon: "Search" },
    { name: "Analytics", href: "/analytics", icon: "BarChart3" },
    { name: "Settings", href: "/settings", icon: "Settings" },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <NavLink
        to={item.href}
        onClick={onClose}
        className={({ isActive }) => cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
          isActive 
            ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30 shadow-lg" 
            : "text-white/70 hover:text-white hover:bg-white/5"
        )}
      >
        <ApperIcon 
          name={item.icon} 
          size={20} 
          className={cn(
            "transition-colors",
            isActive ? "text-primary" : "text-white/60 group-hover:text-white"
          )} 
        />
        <span>{item.name}</span>
        {isActive && (
          <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse" />
        )}
      </NavLink>
    );
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:block w-64 h-screen glass border-r border-white/10 p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
          <ApperIcon name="Mic" size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient">VoiceVault</h1>
          <p className="text-xs text-white/60">AI Audio Intelligence</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
</nav>

      <div className="absolute bottom-6 left-6 right-6 space-y-4">
        {/* User Profile */}
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border border-primary/30">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <ApperIcon name="User" size={20} className="text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-white/60 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ApperIcon name="LogOut" size={14} />
            Sign Out
          </button>
        </div>

        {/* AI Processing Info */}
        <div className="glass-card rounded-lg p-4 text-center">
          <ApperIcon name="Zap" size={24} className="mx-auto text-accent mb-2" />
          <h3 className="font-semibold text-white text-xs mb-1">AI Processing</h3>
          <p className="text-xs text-white/60 mb-2">
            Transform your recordings into insights
          </p>
          <div className="text-xs text-white/40">
            Powered by OpenAI & ElevenLabs
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "lg:hidden fixed top-0 left-0 h-full w-80 glass border-r border-white/10 p-6 z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <ApperIcon name="Mic" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">VoiceVault</h1>
              <p className="text-xs text-white/60">AI Audio Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ApperIcon name="X" size={20} className="text-white/70" />
          </button>
        </div>

<nav className="space-y-2">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
        <div className="absolute bottom-6 left-6 right-6 space-y-4">
          {/* User Profile */}
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border border-primary/30">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <ApperIcon name="User" size={20} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-white/60 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ApperIcon name="LogOut" size={14} />
              Sign Out
            </button>
          </div>

          {/* AI Processing Info */}
          <div className="glass-card rounded-lg p-4 text-center">
            <ApperIcon name="Zap" size={24} className="mx-auto text-accent mb-2" />
            <h3 className="font-semibold text-white text-xs mb-1">AI Processing</h3>
            <p className="text-xs text-white/60 mb-2">
              Transform your recordings into insights
            </p>
            <div className="text-xs text-white/40">
              Powered by OpenAI & ElevenLabs
            </div>
          </div>
        </div>
      </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;