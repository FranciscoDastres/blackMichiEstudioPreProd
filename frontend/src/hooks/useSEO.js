import { useEffect } from "react";

const DEFAULT_TITLE = "Black Michi Estudio | Figuras 3D Personalizadas";
const DEFAULT_DESC =
  "Black Michi Estudio — Figuras impresas en 3D, coleccionables únicos y decoraciones personalizadas. Modelos de cultura pop, anime y ciencia ficción.";

export default function useSEO({ title, description } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | Black Michi Estudio` : DEFAULT_TITLE;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description || DEFAULT_DESC);
    }

    return () => {
      document.title = DEFAULT_TITLE;
      if (metaDesc) metaDesc.setAttribute("content", DEFAULT_DESC);
    };
  }, [title, description]);
}
