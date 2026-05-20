import React, { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/upload", label: "Upload CSV", icon: "📁" },
  { path: "/predict", label: "Single Predict", icon: "🔮" },
  { path: "/metrics", label: "Metrics", icon: "📈" },
  { path: "/drift", label: "Drift Report", icon: "📉" },
  { path: "/history", label: "History", icon: "📜" },
];

const MOBILE_BREAKPOINT = 768;

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [hoveredPath, setHoveredPath] = useState(null);

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(mobile);
    if (!mobile) {
      setIsCollapsed(false);
    } else {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  const sidebarStyle = {
    ...styles.sidebar,
    ...(isMobile
      ? {
          position: "fixed",
          transform: isCollapsed ? "translateX(-100%)" : "translateX(0)",
          zIndex: 1000,
        }
      : {}),
  };

  return (
    <>
      {/* Mobile hamburger button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={styles.hamburger}
          aria-label={isCollapsed ? "Open menu" : "Close menu"}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? "☰" : "✕"}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && !isCollapsed && (
        <div
          style={styles.overlay}
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <aside style={sidebarStyle}>
        <div style={styles.logo}>
          <span style={styles.logoIcon} aria-hidden="true">🛡️</span>
          <span style={styles.logoText}>Network Security</span>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
              style={({ isActive }) => ({
                ...styles.navLink,
                backgroundColor: isActive
                  ? "#3b82f6"
                  : hoveredPath === item.path
                  ? "#334155"
                  : "transparent",
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <span style={styles.navIcon} aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

const styles = {
  sidebar: {
    width: "250px",
    minHeight: "100vh",
    backgroundColor: "#1e293b",
    padding: "20px 0",
    position: "fixed",
    left: 0,
    top: 0,
    transition: "transform 0.3s ease",
  },
  hamburger: {
    position: "fixed",
    top: "15px",
    left: "15px",
    zIndex: 1001,
    width: "40px",
    height: "40px",
    fontSize: "20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#1e293b",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    padding: "0 20px 30px",
    borderBottom: "1px solid #334155",
    marginBottom: "20px",
  },
  logoIcon: {
    fontSize: "28px",
    marginRight: "10px",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    padding: "0 10px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    padding: "12px 15px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "14px",
    transition: "all 0.2s",
    cursor: "pointer",
  },
  navIcon: {
    marginRight: "12px",
    fontSize: "18px",
  },
};

export default Sidebar;
