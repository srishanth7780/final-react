/* eslint-disable */
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { CATEGORIES, MOTIVATIONAL_QUOTES } from "../constants";
import TiltCard from "../components/TiltCard";
import Badge from "../components/Badge";
import ItemCard from "../components/ItemCard";
import CountdownDisplay from "../components/CountdownDisplay";

const HomePage = () => {
  const { items, watchlist } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showSold, setShowSold] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [sortBy, setSortBy] = useState("Ending Soon");
  const [selectedItem, setSelectedItem] = useState(null);

  const todayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % MOTIVATIONAL_QUOTES.length;
  const dailyMotivation = MOTIVATIONAL_QUOTES[todayIndex];

  const featuredItem = useMemo(() =>
    items.filter(item => !item.sold).sort((a, b) => b.currentBid - a.currentBid)[0] || items[0],
    [items]
  );

  const topCategory = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort(([, a], [, b]) => b - a).map(([cat]) => cat)[0] || "Art";
  }, [items]);

  const filtered = useMemo(() => items.filter(item => {
    const matchCat = filter === "All" || item.category === filter;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchSold = showSold ? true : !item.sold;
    const matchWatchlist = showWatchlist ? watchlist.includes(item.id) : true;
    return matchCat && matchSearch && matchSold && matchWatchlist;
  }), [items, filter, search, showSold, showWatchlist, watchlist]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sortBy === "Highest Bid") return copy.sort((a, b) => b.currentBid - a.currentBid);
    if (sortBy === "Most Popular") return copy.sort((a, b) => b.bids.length - a.bids.length);
    return copy.sort((a, b) => a.endsAt - b.endsAt);
  }, [filtered, sortBy]);

  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <div style={{ padding: "40px 32px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
            <div className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#A78BFA" }} />
            <span style={{ fontSize: 12, color: "#C4B5FD", fontWeight: 600 }}>{items.filter(i => !i.sold).length} Active Auctions</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontFamily: "Syne", fontWeight: 800, lineHeight: 1.05, marginBottom: 16, background: "linear-gradient(135deg, #F0F2FF 0%, #A78BFA 50%, #2DD4BF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Bid on the<br />World's Finest
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 480 }}>Real-time auctions for rare collectibles, art, and luxury goods. Secure · Transparent · Live.</p>
          <motion.div whileHover={{ scale: 1.02 }} style={{ marginTop: 20, padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", textAlign: "center", fontStyle: "italic" }}>"{dailyMotivation}"</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginTop: 32, alignItems: "stretch" }}>
            <TiltCard className="glass" style={{ borderRadius: 28, position: "relative", overflow: "hidden", minHeight: 220 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 20%, rgba(167,139,250,0.18), transparent 28%), radial-gradient(circle at 80% 90%, rgba(45,212,191,0.12), transparent 22%)" }} />
              <div style={{ position: "relative", zIndex: 2, padding: 26, display: "flex", height: "100%", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Featured Auction</div>
                  <h2 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.05, marginBottom: 12, fontFamily: "Syne" }}>{featuredItem?.title}</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 420, lineHeight: 1.7 }}>{featuredItem?.description}</p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ padding: "8px 14px", borderRadius: 16, background: "rgba(255,255,255,0.06)", color: "#F5C542", fontWeight: 700 }}>${featuredItem?.currentBid.toLocaleString()}</span>
                  <span style={{ padding: "8px 14px", borderRadius: 16, background: "rgba(45,212,191,0.08)", color: "#2DD4BF", fontWeight: 700 }}>{featuredItem?.bids.length} bids</span>
                  <span style={{ padding: "8px 14px", borderRadius: 16, background: "rgba(167,139,250,0.08)", color: "#C4B5FD", fontWeight: 700 }}>{featuredItem?.category}</span>
                </div>
              </div>
            </TiltCard>
            <div style={{ display: "grid", gap: 16 }}>
              <div className="glass" style={{ borderRadius: 24, padding: 24 }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Quick auction insights</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ padding: 18, background: "rgba(255,255,255,0.04)", borderRadius: 18 }}>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 8 }}>Active listings</div>
                    <div style={{ fontSize: 24, fontFamily: "Syne", fontWeight: 800 }}>{items.filter(i => !i.sold).length}</div>
                  </div>
                  <div style={{ padding: 18, background: "rgba(255,255,255,0.04)", borderRadius: 18 }}>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 8 }}>Watchlist items</div>
                    <div style={{ fontSize: 24, fontFamily: "Syne", fontWeight: 800 }}>{watchlist.length}</div>
                  </div>
                </div>
              </div>
              <div className="glass" style={{ borderRadius: 24, padding: 24 }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Live auction pulse</div>
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Ending soon</span>
                    <strong style={{ color: "#F5C542" }}>{items.filter(i => !i.sold).sort((a, b) => a.endsAt - b.endsAt)[0]?.title ?? "—"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Top category</span>
                    <strong style={{ color: "#A78BFA" }}>{topCategory}</strong>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items…" style={{ maxWidth: 240, borderRadius: 10 }} />
            {["All", ...CATEGORIES].map(cat => (
              <motion.button key={cat} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setFilter(cat)}
                style={{ padding: "7px 16px", borderRadius: 20, background: filter === cat ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.04)", border: filter === cat ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.08)", color: filter === cat ? "#C4B5FD" : "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontFamily: "DM Sans" }}>
                {cat}
              </motion.button>
            ))}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowSold(v => !v)}
              style={{ padding: "7px 16px", borderRadius: 20, background: showSold ? "rgba(251,113,133,0.15)" : "rgba(255,255,255,0.04)", border: showSold ? "1px solid rgba(251,113,133,0.4)" : "1px solid rgba(255,255,255,0.08)", color: showSold ? "#FB7185" : "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontFamily: "DM Sans" }}>
              {showSold ? "Hide Sold" : "Show Sold"}
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowWatchlist(v => !v)}
              style={{ padding: "7px 16px", borderRadius: 20, background: showWatchlist ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)", border: showWatchlist ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.08)", color: showWatchlist ? "#C4B5FD" : "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontFamily: "DM Sans" }}>
              {showWatchlist ? "All Auctions" : "Watchlist Only"}
            </motion.button>
            <motion.select value={sortBy} onChange={e => setSortBy(e.target.value)} whileHover={{ scale: 1.01 }}
              style={{ padding: "8px 16px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", cursor: "pointer", fontSize: 13, fontFamily: "DM Sans", minWidth: 170 }}>
              {['Ending Soon', 'Highest Bid', 'Most Popular'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </motion.select>
          </motion.div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        <AnimatePresence>
          {sorted.map((item, idx) => <ItemCard key={item.id} item={item} index={idx} onClick={setSelectedItem} />)}
        </AnimatePresence>
        {sorted.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 0", color: "var(--text-secondary)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 18 }}>No items match your filters.</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)}
            style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(11,13,23,0.8)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 600, width: "100%", maxHeight: "90vh", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 32, overflow: "hidden", backdropFilter: "blur(32px)" }}>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedItem(null)}
                style={{ position: "absolute", top: 20, right: 20, zIndex: 10, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20 }}>
                ×
              </motion.button>
              <div style={{ position: "relative", height: 400, overflow: "hidden" }}>
                <img src={selectedItem.image} alt={selectedItem.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,13,23,0.9) 0%, transparent 60%)" }} />
                {(selectedItem.sold || selectedItem.endsAt < Date.now()) && (
                  <div style={{ position: "absolute", top: 20, left: 20, background: "rgba(251,113,133,0.9)", color: "#fff", padding: "8px 16px", borderRadius: 12, fontSize: 14, fontWeight: 700, backdropFilter: "blur(8px)" }}>SOLD</div>
                )}
                {!selectedItem.sold && selectedItem.endsAt > Date.now() && (
                  <div style={{ position: "absolute", top: 20, left: 20, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.5)", padding: "8px 16px", borderRadius: 24, backdropFilter: "blur(8px)" }}>
                    <div className="live-dot" style={{ width: 10, height: 10, borderRadius: "50%", background: "#2DD4BF" }} />
                    <span style={{ fontSize: 14, color: "#2DD4BF", fontWeight: 600 }}>LIVE AUCTION</span>
                  </div>
                )}
                <div style={{ position: "absolute", bottom: 20, left: 20 }}><Badge category={selectedItem.category} /></div>
              </div>
              <div style={{ padding: "32px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, fontFamily: "Syne", lineHeight: 1.2 }}>{selectedItem.title}</h2>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24, fontSize: 16 }}>{selectedItem.description}</p>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>Listed by <span style={{ color: "#A78BFA", fontWeight: 600 }}>@{selectedItem.seller}</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 24 }}>
                  {[
                    { label: "Current Bid", value: `$${selectedItem.currentBid.toLocaleString()}`, color: "#F5C542" },
                    { label: "Starting Price", value: `$${selectedItem.startPrice.toLocaleString()}`, color: "var(--text-primary)" },
                    { label: "Reserve Price", value: `$${selectedItem.reservePrice.toLocaleString()}`, color: "#2DD4BF" },
                    { label: "Total Bids", value: selectedItem.bids.length, color: "#A78BFA" },
                  ].map(stat => (
                    <div key={stat.label} className="glass" style={{ borderRadius: 16, padding: "16px 20px" }}>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                      <div style={{ fontSize: 24, fontFamily: "Syne", fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                {!selectedItem.sold && selectedItem.endsAt > Date.now() && (
                  <div className="glass" style={{ borderRadius: 16, padding: "20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Auction ends in</div>
                      <CountdownDisplay endsAt={selectedItem.endsAt} />
                    </div>
                    <div className="live-dot" style={{ width: 16, height: 16, borderRadius: "50%", background: "#2DD4BF", boxShadow: "0 0 16px rgba(45,212,191,0.6)" }} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate(`/item/${selectedItem.id}`)}
                    style={{ flex: 1, padding: "16px", borderRadius: 16, border: "1px solid rgba(245,197,66,0.5)", background: "linear-gradient(135deg, rgba(245,197,66,0.2), rgba(245,197,66,0.1))", color: "#F5C542", fontSize: 16, fontFamily: "Syne", fontWeight: 700, cursor: "pointer" }}>
                    Place Bid →
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: "16px 24px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "var(--text-primary)", fontSize: 16, fontFamily: "DM Sans", fontWeight: 600, cursor: "pointer" }}>
                    View Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
