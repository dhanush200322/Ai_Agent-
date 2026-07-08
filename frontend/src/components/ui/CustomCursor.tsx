"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on large screens (PC) and non-touch devices
    const checkIsDesktop = () => {
      const isLargeScreen = window.innerWidth > 1024;
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      setIsDesktop(isLargeScreen && !isTouch);
    };
    
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      document.body.classList.remove("cursor-none");
      return;
    }
    
    document.body.classList.add("cursor-none");

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest("button") || 
        target.closest("a") ||
        target.classList.contains("cursor-pointer")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      document.body.classList.remove("cursor-none");
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#D4AF37] rounded-full pointer-events-none z-[9999] mix-blend-screen"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isHovering ? 0 : 1,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      />
      
      {/* Glow Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-[#D4AF37] rounded-full pointer-events-none z-[9998] mix-blend-screen"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "rgba(212,175,55,0.1)" : "transparent",
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
      />
      
      {/* Ambient Trail */}
      <motion.div
        className="fixed top-0 left-0 w-32 h-32 bg-[#D4AF37] opacity-10 blur-[40px] rounded-full pointer-events-none z-[9997]"
        animate={{
          x: mousePosition.x - 64,
          y: mousePosition.y - 64,
        }}
        transition={{ type: "tween", ease: "linear", duration: 0.2 }}
      />
    </>
  );
}
