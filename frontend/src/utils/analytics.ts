import type { Metric } from "web-vitals";

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
    clarity?: (method: string, key: string, value: string) => void;
  }
}

function runWhenIdle(callback: () => void): void {
  if (typeof window === "undefined") return;

  const schedule = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 1500));
  if (document.readyState === "complete") {
    schedule(callback);
    return;
  }

  window.addEventListener("load", () => schedule(callback), { once: true });
}

export function initAnalytics(): void {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain || typeof document === "undefined") return;
  if (document.querySelector('script[data-plausible]')) return;

  runWhenIdle(() => {
    const script = document.createElement("script");
    script.defer = true;
    script.setAttribute("data-domain", domain);
    script.setAttribute("data-plausible", "true");
    script.src = import.meta.env.VITE_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";
    document.head.appendChild(script);
  });
}

export function initClarity(): void {
  const clarityId = import.meta.env.VITE_CLARITY_ID;
  if (!import.meta.env.PROD || !clarityId || typeof document === "undefined") return;
  if (document.querySelector("script[data-clarity]")) return;

  runWhenIdle(() => {
    window.clarity = window.clarity || ((...args: unknown[]) => {
      ((window.clarity as unknown as { q?: unknown[] }).q ||= []).push(args);
    }) as Window["clarity"];

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${clarityId}`;
    script.setAttribute("data-clarity", "true");
    document.head.appendChild(script);
  });
}

function sendVital(metric: Metric): void {
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

export function reportWebVitals(): void {
  runWhenIdle(() => {
    import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(sendVital);
      onINP(sendVital);
      onLCP(sendVital);
      onFCP(sendVital);
      onTTFB(sendVital);
    });
  });
}
