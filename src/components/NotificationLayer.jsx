import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { TOAST_COLORS, TOAST_BORDERS, TOAST_ICONS } from "../constants";

const NotificationLayer = () => {
  const { notifications } = useApp();
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
            style={{
              background: TOAST_COLORS[n.type] || TOAST_COLORS.info,
              border: `1px solid ${TOAST_BORDERS[n.type] || TOAST_BORDERS.info}`,
              backdropFilter: "blur(20px)",
              borderRadius: 12,
              padding: "12px 18px",
              display: "flex", alignItems: "center", gap: 10,
              maxWidth: 320,
              fontSize: 14,
            }}
          >
            <span style={{ fontSize: 16 }}>{TOAST_ICONS[n.type]}</span>
            <span>{n.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationLayer;
