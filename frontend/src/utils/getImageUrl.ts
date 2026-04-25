// frontend/src/utils/getImageUrl.ts

/**
 * Genera una URL de imagen optimizada.
 *
 * - Si la URL es de Cloudinary → aplica transformaciones nativas (w_, h_, q_, f_)
 * - Si la URL es de Supabase (imágenes viejas) → las sirve tal cual
 * - Si es una ruta relativa → construye la URL del backend
 */
export function getImageUrl(
  imagePath: string | null | undefined,
  width: number | null = null,
  height: number | null = null,
  quality = 75,
  crop: string | null = null
): string {
  if (!imagePath) return "/placeholder.svg";

  // ── Cloudinary: transformaciones nativas ──────────────────────────────────
  if (imagePath.includes("res.cloudinary.com")) {
    const transforms = ["f_webp"];
    // c_fill recorta al tamaño exacto (igual que CSS object-cover) → evita servir
    // imágenes más grandes de lo que el navegador va a mostrar
    if (crop && width && height) transforms.push(`c_${crop}`);
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (quality) transforms.push(`q_${quality}`);

    // Inserta las transformaciones justo antes de "/upload/"
    return imagePath.replace(
      "/upload/",
      `/upload/${transforms.join(",")}/`
    );
  }

  // ── Supabase (imágenes antiguas): se sirven tal cual ─────────────────────
  if (imagePath.includes("supabase.co")) {
    return imagePath;
  }

  // ── URL externa genérica: añade query params ──────────────────────────────
  if (imagePath.startsWith("http")) {
    let url = imagePath;
    const params: string[] = [];
    if (width) params.push(`width=${width}`);
    if (height) params.push(`height=${height}`);
    if (quality) params.push(`quality=${quality}`);
    if (params.length) {
      url += (url.includes("?") ? "&" : "?") + params.join("&");
    }
    return url;
  }

  // ── Ruta relativa (servida desde el backend) ──────────────────────────────
  const baseURL =
    import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "";
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  const webpPath = cleanPath.replace(/\.(jpg|jpeg|png|gif)$/i, ".webp");
  let url = `${baseURL}${webpPath}`;
  const params: string[] = [];
  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  if (quality) params.push(`quality=${quality}`);
  if (params.length) url += `?${params.join("&")}`;
  return url;
}
