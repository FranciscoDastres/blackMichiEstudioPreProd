import { useState, useEffect, useRef } from "react";

let observer;

function getObserver() {
    if (!observer) {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        observer.unobserve(img);
                    }
                });
            },
            {
                rootMargin: "100px",
            }
        );
    }

    return observer;
}

export default function LazyImage({
    src,
    alt,
    className = "",
    placeholder = "/placeholder.svg",
    width,
    height,
    priority = false,
}) {
    const imgRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);

    useEffect(() => {
        if (priority) return;

        const img = imgRef.current;

        if (!img) return;

        img.dataset.src = src;

        const obs = getObserver();
        obs.observe(img);

        return () => obs.unobserve(img);
    }, [src, priority]);

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={className}
        />
    );
}