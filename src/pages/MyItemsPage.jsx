/* eslint-disable */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ItemCard from "../components/ItemCard";

const MyItemsPage = () => {
  const { items, user } = useApp();
  const navigate = useNavigate();
  const myItems = items.filter(item => item.seller === user?.username);

  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 80px" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 36, marginBottom: 8 }}>My Listed Items</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 40 }}>Manage your auction listings.</p>
          {myItems.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <p style={{ fontSize: 18 }}>You haven't listed any items yet.</p>
              <Link to="/add" style={{ textDecoration: "none" }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{ marginTop: 20, padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg, #A78BFA 0%, #2DD4BF 100%)", color: "#0B0D17", fontSize: 16, fontFamily: "Syne", fontWeight: 700, border: "none", cursor: "pointer" }}>
                  List Your First Item →
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
              <AnimatePresence>
                {myItems.map((item, idx) => (
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

export default MyItemsPage;
