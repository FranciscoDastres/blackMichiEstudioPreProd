import { useState, useEffect, useRef } from "react";

/**
 * Optimiza automáticamente imágenes de Supabase
 * - Reduce tamaño
 * - Reduce calidad
 * - Usa CDN transformation
 */
const optimizeSupabaseImage = (url, width = 400, quality = 70) => {
    if (!url) return url;

    if (url.includes("supabase.co")) {
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}width=${width}&quality=${quality}`;
    }

    return url;
};

/**
 * LazyImage optimizado para Lighthouse
 *
 * Features:
 * - IntersectionObserver lazy loading
 * - fetchPriority para imágenes críticas
 * - decoding async
 * - evita CLS con width/height
 * - optimización automática Supabase
 */
export default function LazyImage({
    src,
    alt,
    className = "",
    placeholder = "/placeholder.svg",
    width = 400,
    height,
    objectFit = "cover",
    priority = false,
    loading = "lazy",
}) {
    const optimizedSrc = optimizeSupabaseImage(src, width);

    const [imageSrc, setImageSrc] = useState(priority ? optimizedSrc : placeholder);
    const [isLoading, setIsLoading] = useState(true);

    const imgRef = useRef(null);

    useEffect(() => {
        if (priority) {
            setIsLoading(false);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setImageSrc(optimizedSrc);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: "50px",
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, [optimizedSrc, priority]);

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${isLoading ? "animate-pulse bg-gray-200" : ""}`}
            onLoad={() => setIsLoading(false)}
            fetchPriority={priority ? "high" : "low"}
            loading={priority ? "eager" : loading}
            decoding="async"
            width={width}
            height={height}
            style={{
                objectFit,
                ...(isLoading && { backgroundColor: "#e5e7eb" }),
            }}
        />
    );
}