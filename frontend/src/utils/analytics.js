import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";

export function initAnalytics() {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain || typeof document === "undefined") return;
  if (document.querySelector('script[data-plausible]')) return;

  const script = document.createElement("script");
  script.defer = true;
  script.setAttribute("data-domain", domain);
  script.setAttribute("data-plausible", "true");
  script.src = import.meta.env.VITE_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";
  document.head.appendChild(script);
}

function sendVital(metric) {
  const payload = {
    name: metric.name,
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    id: metric.id,
    rating: metric.rating,
  };

  if (typeof window !== "undefined" && typeof window.plausible === "function") {
    window.plausible("web-vitals", { props: payload });
  }
  if (typeof window !== "undefined" && typeof window.clarity === "function") {
    window.clarity("set", `webvital_${payload.name}`, String(payload.value));
  }
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[web-vitals]", payload);
  }
}

export function reportWebVitals() {
  onCLS(sendVital);
  onINP(sendVital);
  onLCP(sendVital);
  onFCP(sendVital);
  onTTFB(sendVital);
}
