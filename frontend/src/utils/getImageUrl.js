export function getImageUrl(imagePath, width = null, height = null, quality = 75) {
    if (!imagePath) return "/placeholder.svg";

    if (imagePath.startsWith("http")) {
        let url = imagePath;
        const params = [];
        if (width) params.push(`width=${width}`);
        if (height) params.push(`height=${height}`);
        if (quality) params.push(`quality=${quality}`);
        if (params.length) {
            url += (url.includes('?') ? '&' : '?') + params.join("&");
        }
        return url;
    }

    const baseURL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "";
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    const webpPath = cleanPath.replace(/\.(jpg|jpeg|png|gif)$/i, ".webp");
    let url = `${baseURL}${webpPath}`;
    const params = [];
    if (width) params.push(`width=${width}`);
    if (height) params.push(`height=${height}`);
    if (quality) params.push(`quality=${quality}`);
    if (params.length) url += `?${params.join("&")}`;
    return url;
}