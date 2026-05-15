import React from "react";
import { CAT_COLORS } from "../constants";

const Badge = ({ category }) => {
  const col = CAT_COLORS[category] || { bg: "rgba(255,255,255,0.08)", color: "#fff" };
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 6,
      background: col.bg, color: col.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>{category}</span>
  );
};

export default Badge;
