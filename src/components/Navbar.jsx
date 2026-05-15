import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";

const Navbar = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [themeIdx, setThemeIdx] = useState(0);

  const THEMES = [0, 320, 180, 90];

  const updateThemeHue = (deg) => {
    let overlay = document.getElementById('theme-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'theme-overlay';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '999999';
      overlay.style.transition = 'backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease';
      document.body.appendChild(overlay);
      
      // Remove any previously set body filter that was breaking position: fixed
      document.body.style.filter = '';
    }
    overlay.style.backdropFilter = `hue-rotate(${deg}deg)`;
    overlay.style.webkitBackdropFilter = `hue-rotate(${deg}deg)`;
  };

  const toggleTheme = () => {
    const next = (themeIdx + 1) % THEMES.length;
    setThemeIdx(next);
    updateThemeHue(THEMES[next]);
  };

  const resetTheme = () => {
    setThemeIdx(0);
    updateThemeHue(0);
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
        background: "rgba(11,13,23,0.7)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <motion.div
          whileHover={{ scale: 1.04 }}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #A78BFA, #2DD4BF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, fontFamily: "Syne",
          }}>B</div>
          <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>
            BidVault
          </span>
        </motion.div>
      </Link>

      {/* Center links */}
      <div style={{ display: "flex", gap: 8 }}>
        {(() => {
          const links = [{ to: "/", label: "Explore" }];
          if (user) links.push({ to: "/my-items", label: "My Items" });
          links.push({ to: "/archive", label: "Expired" });
          links.push({ to: "/add", label: "List Item" });
          return links.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ background: "rgba(255,255,255,0.07)" }}
                  style={{
                    padding: "6px 16px", borderRadius: 8,
                    background: "transparent", border: "none",
                    color: isActive ? "#F5C542" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 14, fontFamily: "DM Sans",
                    textDecoration: isActive ? "underline double" : "none",
                    textUnderlineOffset: "4px",
                  }}
                >{link.label}</motion.button>
              </Link>
            );
          });
        })()}
      </div>

      {/* Auth controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <AnimatePresence>
          {themeIdx !== 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0, rotate: 90 }}
              whileHover={{ scale: 1.1, rotate: -180 }}
              whileTap={{ scale: 0.9 }}
              onClick={resetTheme}
              title="Reset Theme"
              style={{
                background: "rgba(251,113,133,0.15)", border: "1px solid rgba(251,113,133,0.3)",
                color: "#FB7185",
                borderRadius: "50%", width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 18,
              }}
            >
              ↺
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          title="Toggle Theme Color"
          style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "50%", width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 16,
          }}
        >
          🎨
        </motion.button>
        {user ? (
          <>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 12px", borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, #A78BFA 0%, #2DD4BF 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
              }}>{user.avatar}</div>
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{user.username}</span>
            </div>
            <motion.button
              whileHover={{ rotateX: 0, rotateY: 0, scale: 1.3 }}
              onClick={logout}
              style={{
                padding: "6px 16px", borderRadius: 8,
                background: "rgba(251,113,133,0.1)",
                border: "1px solid rgba(251,113,133,0.3)",
                color: "#FB7185", cursor: "pointer", fontSize: 13,
                fontFamily: "DM Sans",
              }}
            >Log out</motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
            style={{
              padding: "8px 22px", borderRadius: 10,
              background: "linear-gradient(135deg, rgba(167,139,250,0.3), rgba(45,212,191,0.2))",
              border: "1px solid rgba(167,139,250,0.4)",
              color: "var(--text-primary)", cursor: "pointer",
              fontSize: 14, fontFamily: "Syne", fontWeight: 600,
            }}
          >Sign In</motion.button>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
