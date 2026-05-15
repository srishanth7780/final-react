import React, { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

const TiltCard = ({ children, style, className, onClick }) => {
  const ref = useRef(null);
  const x   = useMotionValue(0);
  const y   = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  const shine   = useTransform(x, [-100, 100], ["rgba(255,255,255,0)", "rgba(255,255,255,0.06)"]);

  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800, ...style }}
      className={className}
    >
      {/* Shine overlay */}
      <motion.div
        style={{
          position: "absolute", inset: 0, borderRadius: "inherit",
          background: shine, pointerEvents: "none", zIndex: 1,
        }}
      />
      {children}
    </motion.div>
  );
};

export default TiltCard;
