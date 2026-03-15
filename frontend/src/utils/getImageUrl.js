export function getImageUrl(imagePath, width = null, height = null, quality = 75) {
    if (!imagePath) return "/placeholder.svg";

    // Si ya es URL completa de Supabase, usar transformaciones nativas
    if (imagePath.startsWith("http")) {
        let url = imagePath;
        const params = [];

        if (width) params.push(`width=${width}`);
        if (height) params.push(`height=${height}`);
        if (quality) params.push(`quality=${quality}`);

        if (params.length) {
            // Agregar separador correcto (? o & depende de si ya hay params)
            url += (url.includes('?') ? '&' : '?') + params.join("&");
        }
        return url;
    }

    const baseURL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "";

    // asegurar slash
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

    // convertir a webp automáticamente
    const webpPath = cleanPath.replace(/\.(jpg|jpeg|png|gif)$/i, ".webp");

    let url = `${baseURL}${webpPath}`;

    const params = [];

    if (width) params.push(`width=${width}`);
    if (height) params.push(`height=${height}`);
    if (quality) params.push(`quality=${quality}`);

    if (params.length) {
        url += `?${params.join("&")}`;
    }

    return url;
}