import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Hide header and mobile nav on active quiz taking screen for full immersion
  const isQuizActive = pathname.startsWith("/tests/") && pathname.split("/").length > 2;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isQuizActive && <Header />}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      {!isQuizActive && <Footer />}
      {!isQuizActive && <MobileNav />}
    </div>
  );
}
