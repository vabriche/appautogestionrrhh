"use client";

import React, { useState, useEffect } from "react";

export const LiveClock: React.FC = React.memo(() => {
  const [hora, setHora] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setHora(
        now.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const fechaHoyTexto = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider capitalize">
        {fechaHoyTexto}
      </p>
      <div className="text-4xl sm:text-5xl font-mono font-bold text-gray-900 tracking-tight">
        {hora || "--:--:--"}
      </div>
    </div>
  );
});

LiveClock.displayName = "LiveClock";
