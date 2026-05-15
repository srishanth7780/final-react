/* eslint-disable */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ItemCard from "../components/ItemCard";

const ArchivePage = () => {
  const { items } = useApp();
  const navigate = useNavigate();
  const archivedItems = items.filter(item => item.sold || Date.now() > item.endsAt);

  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 80px" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 36, marginBottom: 8 }}>Expired</h1>
          <p className="text-white text-xl">you can check the sold items and expired items here.</p>
          <p style={{ color: "var(--text-secondary)", marginBottom: 40 }}>Browse items that have been sold or run out of time.</p>
          {archivedItems.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🕰️</div>
              <p style={{ fontSize: 18 }}>No archived items found.</p>
            </motion.div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
              <AnimatePresence>
                {archivedItems.map((item, idx) => (
                  <ItemCard key={item.id} item={item} index={idx} onClick={(item) => navigate(`/item/${item.id}`)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ArchivePage;
