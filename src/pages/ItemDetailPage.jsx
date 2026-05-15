/* eslint-disable */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Share2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useCountdown } from "../hooks/useCountdown";
import Badge from "../components/Badge";

const ItemDetailPage = () => {
  const { id } = useParams();
  const { items, user, placeBid, addNotification, watchlist, toggleWatchlist } = useApp();
  const navigate = useNavigate();
  const item = items.find(i => i.id === id);
  const { h, m, s, expired } = useCountdown(item?.endsAt || 0);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const isFavorite = item && watchlist.includes(item.id);

  if (!item) return (
    <div style={{ paddingTop: 100, textAlign: "center", color: "var(--text-secondary)" }}>
      Item not found. <Link to="/" style={{ color: "#A78BFA" }}>Go back</Link>
    </div>
  );

  const isSold = item.sold || expired;

  const handleBid = () => {
    if (!user) { navigate("/login"); return; }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= item.currentBid) {
      setBidError(`Bid must exceed current bid of $${item.currentBid.toLocaleString()}`);
      return;
    }
    setBidError("");
    placeBid(item.id, amount);
    setBidAmount("");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addNotification("Link copied to clipboard!", "success");
  };

  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <motion.button whileHover={{ x: -4 }} onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6, fontFamily: "DM Sans" }}>
            ← Back to Explore
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleShare}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", color: "var(--text-primary)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8, fontFamily: "DM Sans" }}>
            <Share2 size={16} /> Share
          </motion.button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          {/* Left: image */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring" }}>
            <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
              <img src={item.image} alt={item.title} style={{ width: "100%", height: 460, objectFit: "cover", display: "block" }} />
              {isSold && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(251,113,133,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 48, fontFamily: "Syne", fontWeight: 800, color: "#FB7185", border: "4px solid #FB7185", padding: "12px 32px", borderRadius: 16, background: "rgba(11,13,23,0.6)", backdropFilter: "blur(8px)" }}>SOLD</div>
                </div>
              )}
            </div>
            <div className="glass" style={{ borderRadius: 16, padding: 20, marginTop: 20 }}>
              <h4 style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Bid History ({item.bids.length})
              </h4>
              {item.bids.length === 0
                ? <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>No bids yet. Be the first!</p>
                : [...item.bids].reverse().map((bid, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < item.bids.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #A78BFA, #2DD4BF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                        {bid.bidder.substring(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13 }}>{bid.bidder}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#F5C542" }}>${bid.amount.toLocaleString()}</span>
                  </motion.div>
                ))
              }
            </div>
          </motion.div>

          {/* Right: details + bid UI */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", delay: 0.1 }}>
            <Badge category={item.category} />
            <h1 style={{ fontSize: 32, fontFamily: "Syne", fontWeight: 800, marginTop: 12, marginBottom: 12, lineHeight: 1.2 }}>{item.title}</h1>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 28 }}>{item.description}</p>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 28 }}>
              Listed by <span style={{ color: "#A78BFA" }}>@{item.seller}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Current Bid", value: `$${item.currentBid.toLocaleString()}`, color: "#F5C542" },
                { label: "Starting Price", value: `$${item.startPrice.toLocaleString()}`, color: "var(--text-primary)" },
                { label: "Reserve Price", value: `$${item.reservePrice.toLocaleString()}`, color: "#2DD4BF" },
                { label: "Total Bids", value: item.bids.length, color: "#A78BFA" },
              ].map(stat => (
                <div key={stat.label} className="glass" style={{ borderRadius: 14, padding: "14px 18px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                  <div style={{ fontSize: 22, fontFamily: "Syne", fontWeight: 700, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {!isSold && (
              <div className="glass" style={{ borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Auction ends in</div>
                  <div style={{ fontSize: 28, fontFamily: "Syne", fontWeight: 800, letterSpacing: "0.04em" }}>
                    {String(h).padStart(2,"0")}<span style={{ color: "var(--text-secondary)" }}>h </span>
                    {String(m).padStart(2,"0")}<span style={{ color: "var(--text-secondary)" }}>m </span>
                    {String(s).padStart(2,"0")}<span style={{ color: "var(--text-secondary)" }}>s</span>
                  </div>
                </div>
                <div className="live-dot" style={{ width: 14, height: 14, borderRadius: "50%", background: "#2DD4BF", boxShadow: "0 0 12px rgba(45,212,191,0.6)" }} />
              </div>
            )}

            {!isSold ? (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                    placeholder={`Enter bid > $${item.currentBid.toLocaleString()}`} style={{ borderRadius: 12 }} />
                  {bidError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: "#FB7185", fontSize: 12, marginTop: 6 }}>
                      {bidError}
                    </motion.p>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                  {[500, 1000, 2000].map(amount => (
                    <motion.button key={amount} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setBidAmount(String(item.currentBid + amount))}
                      style={{ padding: "10px 16px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", cursor: "pointer", fontSize: 13, fontFamily: "DM Sans" }}>
                      +${amount}
                    </motion.button>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => toggleWatchlist(item.id)}
                  style={{ width: "100%", padding: "14px", borderRadius: 14, marginBottom: 14, border: "1px solid rgba(167,139,250,0.4)", background: isFavorite ? "rgba(245,197,66,0.15)" : "rgba(255,255,255,0.06)", color: isFavorite ? "#F5C542" : "var(--text-primary)", fontSize: 15, fontFamily: "DM Sans", fontWeight: 700, cursor: "pointer" }}>
                  {isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(245,197,66,0.4)" }} whileTap={{ scale: 0.98 }} onClick={handleBid}
                  className="pulse-gold"
                  style={{ width: "100%", padding: "14px", borderRadius: 14, border: "1px solid rgba(245,197,66,0.5)", background: "linear-gradient(135deg, rgba(245,197,66,0.2), rgba(245,197,66,0.1))", color: "#F5C542", fontSize: 16, fontFamily: "Syne", fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em" }}>
                  {user ? "Place Bid →" : "Sign In to Bid →"}
                </motion.button>
              </div>
            ) : (
              <div style={{ padding: "20px", borderRadius: 14, textAlign: "center", background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.25)" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔨</div>
                <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, color: "#FB7185" }}>Auction Ended</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>Final price: ${item.currentBid.toLocaleString()}</div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
