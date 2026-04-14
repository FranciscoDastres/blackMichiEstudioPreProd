import { lazy } from "react";

/**
 * Envuelve React.lazy para manejar el caso de "stale chunk":
 * cuando el servidor redeploya, los chunks con hash viejos dejan de existir
 * y el navegador falla al hacer import dinámico (devuelve index.html en su lugar).
 *
 * Estrategia: si el import falla y no hemos intentado recargar todavía en esta
 * sesión, forzamos un window.location.reload() para que el navegador descargue
 * los nuevos chunks. Si ya recargamos antes, dejamos que el error suba al
 * ErrorBoundary (para evitar loops de recarga infinita).
 */
export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const STORAGE_KEY = "chunk-retry-reloaded";
    const alreadyReloaded = JSON.parse(
      window.sessionStorage.getItem(STORAGE_KEY) || "false"
    );

    try {
      const component = await componentImport();
      // Éxito: resetear el flag para futuros deploys
      window.sessionStorage.setItem(STORAGE_KEY, "false");
      return component;
    } catch (error) {
      const isChunkError =
        error?.name === "ChunkLoadError" ||
        /Loading chunk [\d]+ failed/i.test(error?.message || "") ||
        /Failed to fetch dynamically imported module/i.test(error?.message || "") ||
        /Importing a module script failed/i.test(error?.message || "");

      if (isChunkError && !alreadyReloaded) {
        window.sessionStorage.setItem(STORAGE_KEY, "true");
        window.location.reload();
        // Devuelve un componente vacío mientras la página recarga
        return { default: () => null };
      }

      // No es chunk error, o ya recargamos antes → propagar al ErrorBoundary
      throw error;
    }
  });
}
