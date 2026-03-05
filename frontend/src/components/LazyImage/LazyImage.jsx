import { useState, useEffect, useRef } from 'react';

/**
 * ✅ Componente de imagen lazy loading
 * Carga imágenes solo cuando están visibles en pantalla
 * Reduce significativamente el tiempo de carga inicial
 */
export default function LazyImage({
    src,
    alt,
    className = '',
    placeholder = '/placeholder.svg',
    width,
    height,
    objectFit = 'cover'
}) {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef(null);

    useEffect(() => {
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
    }, [src]);

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''}`}
            onLoad={() => setIsLoading(false)}
            width={width}
            height={height}
            style={{
                objectFit,
                ...(isLoading && { backgroundColor: '#e5e7eb' })
            }}
        />
    );
}
