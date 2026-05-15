import React from "react";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --glass-bg: rgba(255,255,255,0.04);
      --glass-border: rgba(255,255,255,0.10);
      --glass-shine: rgba(255,255,255,0.07);
      --accent-gold: #F5C542;
      --accent-teal: #2DD4BF;
      --accent-rose: #FB7185;
      --accent-violet: #A78BFA;
      --surface-1: #0B0D17;
      --surface-2: #111320;
      --surface-3: #181B2E;
      --text-primary: #F0F2FF;
      --text-secondary: #8A90B4;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--surface-1);
      color: var(--text-primary);
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }
    h1, h2, h3, h4 { font-family: 'Syne', sans-serif; }

    /* Noise overlay */
    body::before {
      content: '';
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
      background-size: 180px;
      opacity: 0.4;
    }

    /* Mesh gradient bg */
    body::after {
      content: '';
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 70% 50% at 20% 10%, rgba(167,139,250,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 90%, rgba(45,212,191,0.08) 0%, transparent 60%),
        radial-gradient(ellipse 50% 50% at 60% 30%, rgba(245,197,66,0.05) 0%, transparent 60%);
    }

    /* Glass card */
    .glass {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
    }
    .glass-strong {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.13);
      backdrop-filter: blur(32px) saturate(200%);
      -webkit-backdrop-filter: blur(32px) saturate(200%);
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    /* Input */
    input, textarea, select {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-primary);
      border-radius: 10px;
      padding: 10px 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      width: 100%;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    input:focus, textarea:focus, select:focus {
      border-color: rgba(167,139,250,0.5);
      box-shadow: 0 0 0 3px rgba(167,139,250,0.12);
    }
    input::placeholder, textarea::placeholder { color: var(--text-secondary); }
    select option { background: #1a1d2e; color: var(--text-primary); }

    /* Pulse anim */
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 8px rgba(245,197,66,0.3); }
      50% { box-shadow: 0 0 20px rgba(245,197,66,0.7); }
    }
    .pulse-gold { animation: pulse-glow 2s ease-in-out infinite; }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    .float-anim { animation: float 4s ease-in-out infinite; }

    /* Bubble background */
    .bubble-background {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .bubble-background .bubble {
      position: absolute;
      bottom: -140px;
      border-radius: 50%;
      opacity: 0.75;
      filter: blur(0.6px);
      background: radial-gradient(circle at 30% 30%, rgba(45,212,191,0.45), rgba(167,139,250,0.12));
      animation: float-up var(--bubble-duration, 16s) ease-in infinite;
      animation-delay: var(--bubble-delay, 0s);
      left: var(--bubble-left, 10%);
      width: var(--bubble-size, 80px);
      height: var(--bubble-size, 80px);
      box-shadow: 0 0 32px rgba(45,212,191,0.18);
      transform: translateZ(var(--z, 0px)) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
    }
    @keyframes float-up {
      0% { transform: translateY(0) scale(0.85); opacity: 0.75; }
      50% { opacity: 0.4; }
      100% { transform: translateY(-120vh) scale(1.1); opacity: 0; }
    }

    /* Floating 3D images */
    .bubble-background .floating-3d-img {
      position: absolute;
      bottom: -160px;
      animation: float-up-3d var(--bubble-duration, 16s) ease-in-out infinite;
      animation-delay: var(--bubble-delay, 0s);
      left: var(--bubble-left, 10%);
      width: var(--bubble-size, 80px);
      height: var(--bubble-size, 80px);
      transform-origin: center center;
      object-fit: contain;
      filter: drop-shadow(0px 15px 20px rgba(0,0,0,0.4));
    }

    @keyframes float-up-3d {
      0% { transform: translateY(0) scale(0.7) rotate(0deg); opacity: 0; }
      10% { opacity: 0.8; }
      50% { opacity: 0.9; transform: translateY(-60vh) scale(1.1) rotate(20deg); }
      90% { opacity: 0.7; }
      100% { transform: translateY(-130vh) scale(0.8) rotate(-20deg); opacity: 0; }
    }

    /* Countdown ring */
    @keyframes spin-ring {
      from { stroke-dashoffset: 0; }
      to { stroke-dashoffset: -283; }
    }

    /* Status dot */
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }
    .live-dot { animation: blink 1.4s ease-in-out infinite; }
  `}</style>
);

export default GlobalStyles;
