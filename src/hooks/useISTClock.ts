"use client";

import { useEffect, useState } from "react";

function getISTTime() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function useISTClock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTime(getISTTime());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return time;
}
