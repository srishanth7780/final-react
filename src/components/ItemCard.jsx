/* eslint-disable */
import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { useCountdown } from "../hooks/useCountdown";
import TiltCard from "./TiltCard";
import Badge from "./Badge";

const ItemCard = ({ item, index, onClick }) => {
  const { watchlist, toggleWatchlist } = useApp();
  const { h, m, s, expired } = useCountdown(item.endsAt);

  const isSold = item.sold || expired;
  const isFavorite = watchlist.includes(item.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, type: "spring", damping: 22 }}
      style={{ position: "relative" }}
    >
      <TiltCard
        onClick={() => onClick && onClick(item)}
        style={{
          borderRadius: 20, overflow: "hidden", cursor: "pointer",
          position: "relative", transformStyle: "preserve-3d",
        }}
        className="glass"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); toggleWatchlist(item.id); }}
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 3,
            width: 38, height: 38, borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: isFavorite ? "rgba(245,197,66,0.16)" : "rgba(255,255,255,0.06)",
            color: isFavorite ? "#F5C542" : "#fff",
            display: "grid", placeItems: "center",
            cursor: "pointer",
            backdropFilter: "blur(18px)",
          }}
          aria-label={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
        >
          {isFavorite ? "♥" : "♡"}
        </motion.button>

        {/* Image */}
        <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
          <motion.img
            src={item.image}
            alt={item.title}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {/* Overlay gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(11,13,23,0.85) 0%, transparent 50%)",
          }} />
          {/* Sold badge */}
          {isSold && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(251,113,133,0.85)", color: "#fff",
              padding: "4px 12px", borderRadius: 6,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              backdropFilter: "blur(8px)",
            }}>SOLD</div>
          )}
          {/* Live indicator */}
          {!isSold && (
            <div style={{
              position: "absolute", top: 12, left: 12,
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(0,0,0,0.4)", padding: "4px 10px", borderRadius: 20,
              backdropFilter: "blur(8px)",
            }}>
              <div className="live-dot" style={{
                width: 7, height: 7, borderRadius: "50%", background: "#2DD4BF",
              }} />
              <span style={{ fontSize: 11, color: "#2DD4BF", fontWeight: 600 }}>LIVE</span>
            </div>
          )}
          {/* Category */}
          <div style={{ position: "absolute", bottom: 12, left: 12 }}>
            <Badge category={item.category} />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "16px 18px 18px" }}>
          <h3 style={{
            fontSize: 15, fontWeight: 700, marginBottom: 6,
            fontFamily: "Syne", lineHeight: 1.3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{item.title}</h3>
          <p style={{
            fontSize: 12, color: "var(--text-secondary)", marginBottom: 14,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>{item.description}</p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            {/* Current bid */}
            <div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>
                {isSold ? "Final bid" : "Current bid"}
              </div>
              <div style={{
                fontSize: 20, fontWeight: 700, fontFamily: "Syne",
                color: isSold ? "#FB7185" : "#F5C542",
              }}>
                ${item.currentBid.toLocaleString()}
              </div>
            </div>

            {/* Countdown */}
            {!isSold ? (
              <div style={{
                textAlign: "right",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "8px 12px",
              }}>
                <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 2 }}>Ends in</div>
                <div style={{ fontSize: 15, fontFamily: "Syne", fontWeight: 700, letterSpacing: "0.02em" }}>
                  {String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#FB7185", fontWeight: 600 }}>
                {item.bids.length} bid{item.bids.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
};

export default ItemCard;
