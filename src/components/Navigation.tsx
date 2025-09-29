import React, { useEffect, useState } from "react";
import { Upload, Shield, Code, Info, Menu, X, LogOut, Moon, Sun } from "lucide-react";
import type { User } from "../types";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

interface NavigationProps {
  user?: User | null;
  onLogout?: () => void;
}

const navItems = [
  { id: "upload" as const, label: "Upload", icon: Upload, path: "/" },
  { id: "admin" as const, label: "Admin", icon: Shield, path: "/admin" },
  { id: "docs" as const, label: "API Docs", icon: Code, path: "/docs" },
  { id: "about" as const, label: "About", icon: Info, path: "/about" },
];

export function Navigation({ user, onLogout }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Initialize dark mode from localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setDarkMode(initialDark);
    if (initialDark) {
      document.documentElement.classList.add("dark");
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setDarkMode(e.matches);
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleCloseMobileMenu = () => {
    setMobileOpen(false);
  };

  const renderNavButtons = (variant: "desktop" | "mobile") => (
    <div className={variant === "desktop" ? "flex items-center space-x-1" : "space-y-1"}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const resolved = useResolvedPath(item.path);
        const match = useMatch({ path: resolved.pathname, end: item.path === "/" }); // `end: true` for exact match, except for home
        const isActive = Boolean(match);

        const baseClasses =
          variant === "desktop"
            ? "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors duration-200"
            : "flex items-center space-x-3 px-4 py-3 rounded-lg text-base transition-colors duration-200";
        const activeClasses = "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
        const inactiveClasses = variant === "desktop"
          ? "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";

        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={handleCloseMobileMenu}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Telegram Image</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Self-hosted image hosting</p>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {renderNavButtons("desktop")}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 dark:text-gray-300">Welcome, {user.username}</span>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-50 md:hidden pointer-events-none transition-opacity duration-300 ease-in-out ${mobileOpen ? "opacity-100" : "opacity-0"}`}>
        <div
          className={`absolute inset-0 bg-black/40 dark:bg-black/60 transition-opacity duration-300 ease-in-out ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 max-w-full bg-white dark:bg-gray-900 shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out pointer-events-auto border-r border-gray-200 dark:border-gray-700 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700">
            <Link to="/" className="flex items-center gap-2" onClick={handleCloseMobileMenu}>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">Telegram Image</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quick actions</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4">
            {renderNavButtons("mobile")}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">{darkMode ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>
          </div>

          {user && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="font-medium text-gray-900 dark:text-white">{user.username}</div>
              <button
                onClick={() => {
                  onLogout?.();
                  setMobileOpen(false);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}