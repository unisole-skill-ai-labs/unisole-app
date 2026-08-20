import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Compass, BookOpen, Award, User, LogIn } from "lucide-react";

export default function MobileNav() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  const tabs = [
    { name: "Explore", path: "/", icon: Compass },
    { name: "Enrolled", path: "/enrolled", icon: BookOpen, authOnly: true },
    { name: "Tests", path: "/tests", icon: Award, authOnly: true },
    {
      name: isAuthenticated ? "Profile" : "Sign In",
      path: isAuthenticated ? "/profile" : "/login",
      icon: isAuthenticated ? User : LogIn,
    },
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-3 py-1.5 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          if (tab.authOnly && !isAuthenticated) return null;
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[64px] min-h-[48px] rounded-xl transition-all ${
                active
                  ? "text-indigo-600 font-bold scale-105"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  active ? "bg-indigo-50" : "bg-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
