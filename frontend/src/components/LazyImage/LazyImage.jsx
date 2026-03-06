import { useState, useEffect, useRef } from 'react';

/**
 * ✅ Componente LazyImage mejorado para Lighthouse
 * 
 * CAMBIOS:
 * - fetchPriority para imágenes críticas
 * - decoding="async" para no bloquear
 * - width/height explícitos para evitar CLS
 * - Intersection Observer para lazy loading
 */
export default function LazyImage({
    src,
    alt,
    className = '',
    placeholder = '/placeholder.svg',
    width,
    height,
    objectFit = 'cover',
    priority = false, // ✅ NUEVO: marcar como crítica
    loading = 'lazy',
}) {
    const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef(null);

    useEffect(() => {
        if (priority) {
            setIsLoading(false);
            return;
        }

        // ✅ Usar Intersection Observer para lazy loading
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setImageSrc(src);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px' // Cargar 50px antes de aparecer
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
    }, [src, priority]);

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''}`}
            onLoad={() => setIsLoading(false)}
            // ✅ CAMBIOS PARA LIGHTHOUSE
            fetchPriority={priority ? 'high' : 'low'}
            loading={priority ? 'eager' : loading}
            decoding="async"
            // ✅ Dimensiones explícitas para evitar CLS
            width={width}
            height={height}
            style={{
                objectFit,
                ...(isLoading && { backgroundColor: '#e5e7eb' })
            }}
        />
    );
}
