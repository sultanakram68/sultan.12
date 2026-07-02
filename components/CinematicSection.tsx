"use client";

import React, { useRef } from "react";
import { useScroll } from "framer-motion";
import { ScrollytellingCanvas } from "./ScrollytellingCanvas";
import { ScrollSections } from "./ScrollSections";

export function CinematicSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress specifically for this 600vh section, 
  // ensuring the animation only plays while this section is active.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative h-[600vh] w-full bg-black z-10">
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <ScrollytellingCanvas frameCount={278} scrollYProgress={scrollYProgress} />
        <ScrollSections scrollYProgress={scrollYProgress} />
      </div>
    </section>
  );
}
