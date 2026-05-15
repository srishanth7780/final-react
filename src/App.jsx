/* eslint-disable */
// ============================================================
// BIDDING APP — Modular React + Vite + Framer Motion
// Dark Mode Glassmorphism · JWT Auth · Real-Time State
// ============================================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Chatbot from "./components/chatbot";

// Context
import { AppProvider } from "./context/AppContext";

// Global UI
import GlobalStyles from "./components/GlobalStyles";
import BubbleBackground from "./components/BubbleBackground";
import NotificationLayer from "./components/NotificationLayer";
import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import ArchivePage from "./pages/ArchivePage";
import MyItemsPage from "./pages/MyItemsPage";
import AddItemPage from "./pages/AddItemPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <GlobalStyles />
        <BubbleBackground />
        <NotificationLayer />
        <Navbar />
        <main style={{ position: "relative", zIndex: 1 }}>
          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/item/:id" element={<ItemDetailPage />} />
            <Route path="/archive"  element={<ArchivePage />} />
            <Route path="/my-items" element={
              <RequireAuth>
                <MyItemsPage />
              </RequireAuth>
            } />
            <Route path="/add" element={
              <RequireAuth>
                <AddItemPage />
              </RequireAuth>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </AppProvider>
      <Chatbot />
    </BrowserRouter>
  );
}
