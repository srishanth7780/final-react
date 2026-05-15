import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { MOCK_USERS, generateSeeds, jwtUtils, cookieUtils } from "../constants";

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [items, setItems]       = useState([]);
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem("bv_watchlist");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [notifications, setNotifications] = useState([]);

  // Fetch items from backend
  useEffect(() => {
    fetch('http://127.0.0.1:3001/api/items')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error("Failed to fetch items:", err));
  }, []);

  // Sync watchlist → localStorage
  useEffect(() => {
    localStorage.setItem("bv_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Restore session from cookie on mount
  useEffect(() => {
    const token = cookieUtils.get("bv_token");
    if (token && jwtUtils.verify(token)) {
      const payload = jwtUtils.decode(token);
      const found = MOCK_USERS.find(u => u.id === payload.id);
      if (found) setUser({ ...found });
    }
  }, []);

  // Mark expired items as sold
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        let changed = false;
        const next = prev.map(item => {
          if (!item.sold && item.endsAt < Date.now()) {
            changed = true;
            const updated = { ...item, sold: true };
            fetch(`http://127.0.0.1:3001/api/items/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updated)
            }).catch(console.error);
            return updated;
          }
          return item;
        });
        return changed ? next : prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = useCallback((msg, type = "info") => {
    const id = uuidv4();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const toggleWatchlist = useCallback((itemId) => {
    setWatchlist(prev => {
      const next = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      addNotification(
        next.includes(itemId)
          ? "Added item to your watchlist."
          : "Removed item from your watchlist.",
        "info"
      );
      return next;
    });
  }, [addNotification]);

  const login = useCallback((username, password) => {
    const found = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (!found) return false;
    const token = jwtUtils.encode({ id: found.id, username: found.username, role: found.role });
    cookieUtils.set("bv_token", token);
    setUser({ ...found });
    addNotification(`Welcome back, ${found.username}! 👋`, "success");
    return true;
  }, [addNotification]);

  const logout = useCallback(() => {
    cookieUtils.delete("bv_token");
    setUser(null);
    addNotification("Logged out successfully.", "info");
  }, [addNotification]);

  const addItem = useCallback(async (itemData) => {
    const newItem = {
      id: uuidv4(),
      ...itemData,
      currentBid: itemData.startPrice,
      bids: [],
      seller: user?.username,
      sold: false,
      endsAt: Date.now() + itemData.duration * 3600000,
    };
    try {
      const res = await fetch('http://127.0.0.1:3001/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        const savedItem = await res.json();
        setItems(prev => [savedItem, ...prev]);
        addNotification(`"${itemData.title}" listed successfully!`, "success");
      }
    } catch (err) {
      addNotification("Failed to add item to server", "error");
    }
  }, [user, addNotification]);

  const placeBid = useCallback(async (itemId, amount) => {
    if (!user) return false;
    
    const item = items.find(i => i.id === itemId);
    if (!item || amount <= item.currentBid || item.sold) return false;
    
    const newBid = { bidder: user.username, amount, time: Date.now() };
    const updatedItem = {
      ...item,
      currentBid: amount,
      bids: [...item.bids, newBid],
    };
    
    try {
      const res = await fetch(`http://127.0.0.1:3001/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      if (res.ok) {
        const savedItem = await res.json();
        setItems(prev => prev.map(i => i.id === itemId ? savedItem : i));
        addNotification(`Bid of $${amount.toLocaleString()} placed!`, "success");
        return true;
      }
    } catch (err) {
      addNotification("Failed to place bid", "error");
    }
    return false;
  }, [user, items, addNotification]);

  const value = useMemo(() => ({
    user, items, notifications, watchlist,
    login, logout, addItem, placeBid, toggleWatchlist, addNotification,
  }), [user, items, notifications, watchlist, login, logout, addItem, placeBid, toggleWatchlist, addNotification]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
