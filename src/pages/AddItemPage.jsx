/* eslint-disable */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../constants";

const AddItemPage = () => {
  const { addItem } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", image: "", category: "Art",
    startPrice: "", reservePrice: "", duration: 24,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Title required";
    if (!form.description.trim()) e.description = "Description required";
    if (!form.image.trim())       e.image       = "Image URL required";
    if (!form.startPrice || +form.startPrice <= 0)   e.startPrice   = "Valid start price required";
    if (!form.reservePrice || +form.reservePrice <= 0) e.reservePrice = "Valid reserve price required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    addItem({ ...form, startPrice: +form.startPrice, reservePrice: +form.reservePrice, duration: +form.duration });
    setSubmitting(false);
    navigate("/");
  };

  const fields = [
    { key: "title", label: "Item Title", placeholder: "e.g. Vintage Rolex Daytona 1970", type: "text" },
    { key: "image", label: "Image URL", placeholder: "https://images.unsplash.com/…", type: "text" },
    { key: "startPrice", label: "Starting Price ($)", placeholder: "500", type: "number" },
    { key: "reservePrice", label: "Reserve Price ($)", placeholder: "2000", type: "number" },
  ];

  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 32px 80px" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 36, marginBottom: 8 }}>List a New Item</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 40 }}>Your item will be broadcast to all active bidders in real-time.</p>
          <div className="glass-strong" style={{ borderRadius: 24, padding: 32 }}>
            {fields.map(f => (
              <div key={f.key} style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 7 }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} />
                {errors[f.key] && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "#FB7185", fontSize: 12, marginTop: 5 }}>
                    {errors[f.key]}
                  </motion.p>
                )}
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 7 }}>Description</label>
              <textarea value={form.description} onChange={set("description")}
                placeholder="Describe your item — provenance, condition, authenticity…"
                rows={4} style={{ borderRadius: 12, resize: "vertical" }} />
              {errors.description && <p style={{ color: "#FB7185", fontSize: 12, marginTop: 5 }}>{errors.description}</p>}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 7 }}>Category</label>
              <select value={form.category} onChange={set("category")} style={{ borderRadius: 10 }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 7 }}>
                Auction Duration: <span style={{ color: "#A78BFA" }}>{form.duration}h</span>
              </label>
              <input type="range" min={1} max={168} value={form.duration} onChange={set("duration")}
                style={{ padding: 0, border: "none", background: "transparent", height: 4 }} />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={submitting}
              style={{ width: "100%", padding: "15px", borderRadius: 14, border: "1px solid rgba(167,139,250,0.5)", background: "linear-gradient(135deg, rgba(167,139,250,0.25), rgba(45,212,191,0.15))", color: "var(--text-primary)", fontSize: 16, fontFamily: "Syne", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? <span>Publishing…</span> : <span>Publish Listing →</span>}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddItemPage;
