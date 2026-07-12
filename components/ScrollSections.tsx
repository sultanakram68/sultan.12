"use client";

import React from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

interface ScrollSectionsProps {
  scrollYProgress: MotionValue<number>;
}

export function ScrollSections({ scrollYProgress }: ScrollSectionsProps) {
  const { t, language } = useLanguage();
  const dir = language === "ar" ? "rtl" : "ltr";

  // Typography animations mapped to scroll progress (0 to 1)
  // Scene 1: Intro (0 to 0.15)
  const introOpacity = useTransform(scrollYProgress, [0, 0.05, 0.1, 0.15], [1, 1, 0, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  // Scene 2: Disassembly / Chipset (0.2 to 0.4)
  const chipsetOpacity = useTransform(scrollYProgress, [0.15, 0.25, 0.35, 0.45], [0, 1, 1, 0]);
  const chipsetY = useTransform(scrollYProgress, [0.15, 0.25, 0.35, 0.45], [50, 0, 0, -50]);

  // Scene 3: Camera System (0.5 to 0.7)
  const cameraOpacity = useTransform(scrollYProgress, [0.45, 0.55, 0.65, 0.75], [0, 1, 1, 0]);
  const cameraY = useTransform(scrollYProgress, [0.45, 0.55, 0.65, 0.75], [50, 0, 0, -50]);

  // Scene 4: Titanium Design Reassembly (0.8 to 1.0)
  const designOpacity = useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 1, 1]);
  const designY = useTransform(scrollYProgress, [0.8, 0.9, 1], [50, 0, 0]);

  return (
    <div className="absolute inset-0 z-10 w-full h-full pointer-events-none flex flex-col items-center">
      
      {/* Intro Scene */}
      <motion.div 
        style={{ opacity: introOpacity, y: introY }}
        className="absolute top-[25%] left-0 w-full text-center px-4"
        dir={dir}
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-2xl mb-4 text-white" style={{ lineHeight: "1.4" }}>
          {t("scroll.scene1")}
        </h1>
      </motion.div>

      {/* Chipset Scene */}
      <motion.div 
        style={{ opacity: chipsetOpacity, y: chipsetY }}
        className={`absolute top-[30%] md:top-[40%] px-4 max-w-sm ${language === "ar" ? "right-[5%] md:right-[10%] text-right" : "left-[5%] md:left-[10%] text-left"}`}
        dir={dir}
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white" style={{ lineHeight: "1.3" }}>
          {t("scroll.scene2")}
        </h2>
      </motion.div>

      {/* Camera Scene */}
      <motion.div 
        style={{ opacity: cameraOpacity, y: cameraY }}
        className={`absolute top-[30%] md:top-[40%] px-4 max-w-sm ${language === "ar" ? "left-[5%] md:left-[10%] text-left" : "right-[5%] md:right-[10%] text-right"}`}
        dir={dir}
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white" style={{ lineHeight: "1.3" }}>
          {t("scroll.scene3")}
        </h2>
      </motion.div>

      {/* Titanium Design Scene */}
      <motion.div 
        style={{ opacity: designOpacity, y: designY }}
        className="absolute bottom-[15%] left-0 w-full text-center px-4"
        dir={dir}
      >
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white" style={{ lineHeight: "1.4" }}>
          {t("scroll.scene4")}
        </h2>
        <button className="pointer-events-auto bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-200 transition-colors">
          {t("scroll.browse")}
        </button>
      </motion.div>

    </div>
  );
}
