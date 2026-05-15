import React from "react";

const BubbleBackground = () => (
  <div className="bubble-background">
    {/* Soft glass bubbles */}
    {Array.from({ length: 8 }).map((_, index) => {
      const z = Math.random() * 400 - 200; // -200 to 200
      const rx = Math.random() * 20 - 10; // -10 to 10 deg
      const ry = Math.random() * 20 - 10;
      return (
        <div
          key={`bubble-${index}`}
          className="bubble"
          style={{
            '--bubble-size': `${40 + ((index % 5) * 20)}px`,
            '--bubble-left': `${(index * 12) % 100}%`,
            '--bubble-duration': `${14 + (index % 4) * 4}s`,
            '--bubble-delay': `${(index % 6) * 0.8}s`,
            '--z': `${z}px`,
            '--rx': `${rx}deg`,
            '--ry': `${ry}deg`,
          }}
        />
      );
    })}
    {/* Floating 3D Premium Images */}
    {Array.from({ length: 6 }).map((_, index) => {
      const z = Math.random() * 400 - 200;
      const rx = Math.random() * 40 - 20;
      const ry = Math.random() * 40 - 20;
      const imgSrc2 = "https://i.postimg.cc/9QNgZPgG/Whats-App-Image-2026-05-13-at-10-53-53-AM.jpg"
      const imgSrc= "https://i.postimg.cc/jjcG2yQ8/IMG-20260511-221344.jpg"
      
      return (
        <div key={`container-${index}`}>
        <img
          key={`img-${index}`}
          src={imgSrc}
          className="floating-3d-img rounded-full"
          alt="3D floating element"
          style={{
            '--bubble-size': `${60 + ((index % 3) * 30)}px`,
            '--bubble-left': `${(index * 15 + 5) % 100}%`,
            '--bubble-duration': `${18 + (index % 3) * 5}s`,
            '--bubble-delay': `${(index % 5) * 1.5}s`,
            '--z': `${z}px`,
            '--rx': `${rx}deg`,
            '--ry': `${ry}deg`,
          }}
          />
          <img
          key={`img-2-${index}`}
          src={imgSrc2}
          className="floating-3d-img rounded-full"
          alt="3D floating element"
          style={{
            '--bubble-size': `${50 + ((index % 4) * 25)}px`,
            '--bubble-left': `${(index * 25 + 40) % 100}%`,
            '--bubble-duration': `${22 + (index % 3) * 4}s`,
            '--bubble-delay': `${(index % 4) * 2}s`,
            '--z': `${z * 0.8 - 50}px`,
            '--rx': `${rx + 20}deg`,
            '--ry': `${ry - 20}deg`,
          }}
        />
          </div>
      );
    })}
  </div>
);

export default BubbleBackground;
