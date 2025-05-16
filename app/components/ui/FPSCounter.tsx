"use client"

import React, { useEffect, useState } from 'react';

export default function FPSCounter() {
  const [fps, setFps] = useState<number>(0);
  const [frames, setFrames] = useState<number>(0);
  const [lastTime, setLastTime] = useState<number>(performance.now());

  useEffect(() => {
    let frameId: number;
    
    const countFrame = () => {
      const now = performance.now();
      setFrames(prevFrames => prevFrames + 1);
      
      // Update FPS every second
      if (now - lastTime >= 1000) {
        setFps(Math.round((frames * 1000) / (now - lastTime)));
        setFrames(0);
        setLastTime(now);
      }
      
      frameId = requestAnimationFrame(countFrame);
    };
    
    frameId = requestAnimationFrame(countFrame);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [frames, lastTime]);

  return (
    <div className="fixed bottom-0 right-1/2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-mono z-50">
      {fps} FPS
    </div>
  );
}