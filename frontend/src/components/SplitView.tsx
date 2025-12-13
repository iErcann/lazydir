import { useState, useRef, useEffect } from 'react';
import type { Pane, Tab } from "../types";
import { FileManagerPane } from "./FileManagerPane";

export function SplitView({ tab }: { tab: Tab }) {
  const [splitPercentage, setSplitPercentage] = useState(50); // 50% by default
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Single pane
  if (tab.panes.length === 1) {
    return <FileManagerPane tab={tab} pane={tab.panes[0]} />;
  }

  const handleDragMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
     setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      
      // Calculate percentage (clamp between 10% and 90%)
      const percentage = (mouseX / containerRect.width) * 100;
      const clampedPercentage = Math.max(10, Math.min(90, percentage));
      
      setSplitPercentage(clampedPercentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Create a window resize event to notify other components
      window.dispatchEvent(new Event('resize')); // i could also put this in the "handleMouseMove" but could make too much CPU usage 
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  console.log("Split rerendered.")
  // Two panes with draggable splitter
  return (
    <div 
      ref={containerRef}
      className={`flex h-full ${isDragging ? 'select-none' : ''}`}
    >
      {/* Left Pane */}
      <div 
        style={{ width: `${splitPercentage}%` }}
        className="overflow-hidden"
      >
        <FileManagerPane tab={tab} pane={tab.panes[0]} />
      </div>

      {/* Draggable Divider */}
      <div
        onMouseDown={handleDragMouseDown}
        className={`
          w-1 bg-[var(--bg-tertiary)] cursor-col-resize 
          hover:bg-[var(--bg-secondary)] transition-colors
          ${isDragging ? 'bg-[var(--bg-accent)]' : ''}
        `}
      />

      {/* Right Pane */}
      <div 
        style={{ width: `${100 - splitPercentage}%` }}
        className="overflow-hidden"
      >
        <FileManagerPane tab={tab} pane={tab.panes[1]} />
      </div>
    </div>
  );
}