import React from "react";
import { Link, useLocation } from "react-router-dom";
import {  BarChart3 } from "lucide-react";

const Navbar = ({ getPortfolio }) => {
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Market AI", path: "/research" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/20">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-black">
                   <span className="text-blue-400">    Trade       Pulse</span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Smart portfolio tracking
              </p>  
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Overview
            </p>
            <h2 className="text-sm font-semibold text-slate-200">
              Stock Portfolio Dashboard
            </h2>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
