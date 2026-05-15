/* eslint-disable */
import React from "react";
import { useCountdown } from "../hooks/useCountdown";

const CountdownDisplay = ({ endsAt }) => {
  const { h, m, s } = useCountdown(endsAt);
  return (
    <div style={{ fontSize: 32, fontFamily: "Syne", fontWeight: 800, letterSpacing: "0.04em" }}>
      {String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
    </div>
  );
};

export default CountdownDisplay;
