"use client";

import { useEffect } from "react";
import { ETHICAL_ADS_PUBLISHER, adsEnabled } from "@/lib/ads";

declare global {
  interface Window {
    ethicalads?: { load: () => void };
  }
}

const SCRIPT_SRC = "https://media.ethicalads.io/media/client/ethicalads.min.js";

/**
 * Renders a single EthicalAds slot. No-op (and loads zero remote code) unless a
 * publisher ID is configured in `@/lib/ads`, so the default build stays fully
 * offline and dependency-free.
 */
export function EthicalAd({
  type = "text",
  className = "",
}: {
  type?: "text" | "image";
  className?: string;
}) {
  useEffect(() => {
    if (!adsEnabled) return;
    // Script already present → just (re)scan the DOM for ad slots.
    if (window.ethicalads) {
      window.ethicalads.load();
      return;
    }
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  if (!adsEnabled) return null;

  return (
    <div className={`ad-slot ${className}`.trim()}>
      <div data-ea-publisher={ETHICAL_ADS_PUBLISHER} data-ea-type={type} />
    </div>
  );
}
