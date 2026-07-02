"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, MotionValue, useSpring } from "framer-motion";

interface ScrollytellingCanvasProps {
  frameCount: number;
  scrollYProgress: MotionValue<number>;
}

export function ScrollytellingCanvas({ frameCount, scrollYProgress }: ScrollytellingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const currentFrameRef = useRef(1);

  // Preload images intelligently
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];

    // 1. Create empty image objects for all frames so the array is populated
    for (let i = 1; i <= frameCount; i++) {
      loadedImages.push(new Image());
    }
    setImages(loadedImages);

    // 2. Function to load the rest of the images
    const loadRemaining = () => {
      for (let i = 2; i <= frameCount; i++) {
        const frameString = i.toString().padStart(3, "0");
        loadedImages[i - 1].src = `/8888/frame_${frameString}.jpg`;
      }
    };

    // 3. Load ONLY the first frame to prioritize it
    loadedImages[0].onload = () => {
      setLoaded(true); // Remove black screen instantly
      loadRemaining(); // Start background loading for the rest
    };
    loadedImages[0].onerror = () => {
      setLoaded(true);
      loadRemaining();
    };
    
    // Trigger the first request
    loadedImages[0].src = `/8888/frame_001.jpg`;

  }, [frameCount]);

  // Draw frame
  const drawFrame = (frameIndex: number) => {
    if (!canvasRef.current || !images[frameIndex - 1]) return;
    const img = images[frameIndex - 1];
    
    // If this specific frame hasn't finished downloading yet, abort drawing to avoid flickering
    if (!img.complete) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Maintain aspect ratio while covering the canvas
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    // Clear and draw background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Setup canvas size
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // High DPI canvas for crispness
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        
        if (loaded) {
          // Just request a redraw
          requestAnimationFrame(() => drawFrame(currentFrameRef.current));
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [loaded]);

  // Initial draw
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (loaded) {
      drawFrame(currentFrameRef.current);
    }
  }, [loaded]);

  // Smooth out the scroll progress to prevent choppy frame skipping (especially on mouse wheels)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Listen to the smoothed scroll and update frame
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (!loaded) return;
    
    // Map scroll progress (0-1) to frame count
    const targetFrame = Math.max(1, Math.min(frameCount, Math.round(latest * frameCount)));
    
    if (targetFrame !== currentFrameRef.current) {
      currentFrameRef.current = targetFrame;
      // Fast draw directly bypassing React state for maximum performance
      requestAnimationFrame(() => drawFrame(targetFrame));
    }
  });

  return (
    <div className="absolute inset-0 w-full h-full bg-black z-0 pointer-events-none">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm tracking-widest uppercase">
          Loading Cinematic Sequence...
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 1s ease-in-out" }}
      />
    </div>
  );
}
