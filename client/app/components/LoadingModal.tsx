"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  requestStartTime?: number;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  requestStartTime,
}) => {
  const [message, setMessage] = useState("Loading...");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen || !requestStartTime) {
      setMessage("Loading...");
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const currentElapsed = Math.floor((now - requestStartTime) / 1000);
      setElapsed(currentElapsed);

      if (currentElapsed <= 3) {
        setMessage("Loading...");
      } else if (currentElapsed <= 10) {
        setMessage("Processing your request...");
      } else if (currentElapsed <= 20) {
        setMessage("Server is waking up, please wait...");
      } else {
        setMessage("This is taking longer than usual, server is starting up...");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, requestStartTime]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-200">
      <div className="bg-surface-primary border border-border-primary rounded-modal shadow-modal p-6 w-full max-w-md mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          </div>
          
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
            {message}
          </h3>
          
          {elapsed > 10 && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              The server is starting up from sleep mode. This usually takes 30-60 seconds.
            </p>
          )}
          
          {elapsed > 0 && (
            <div className="text-xs text-neutral-500 dark:text-neutral-500">
              {elapsed} second{elapsed !== 1 ? "s" : ""} elapsed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;