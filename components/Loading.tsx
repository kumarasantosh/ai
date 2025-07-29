import React from "react";

export default function NeonLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="flex flex-col items-center gap-6">
        {/* Neon circle */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500 shadow-lg shadow-cyan-500/50 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border border-pink-500 shadow-lg shadow-pink-500/50 animate-spin"></div>
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 animate-pulse"></div>
        </div>

        {/* Neon text */}
        <p
          className="text-cyan-400 text-xl font-mono tracking-widest animate-pulse"
          style={{ textShadow: "0 0 10px #00ffff" }}
        >
          LOADING...
        </p>
      </div>
    </div>
  );
}
