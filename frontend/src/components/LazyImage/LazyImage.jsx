import { useState, useEffect, useRef } from "react";

let observer;

function getObserver() {
    if (!observer) {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;

                        if (img.dataset.src) {
                            img.setAttribute("data-loaded", "true");
                        }

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

        const obs = getObserver();

        const handleIntersect = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setImageSrc(src);
                    obs.unobserve(img);
                }
            });
        };

        const localObserver = new IntersectionObserver(handleIntersect, {
            rootMargin: "300px",
        });

        localObserver.observe(img);

        return () => localObserver.disconnect();
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