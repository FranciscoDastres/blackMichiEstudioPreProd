import { useState, useEffect, useRef } from "react";

let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.setAttribute("data-loaded", "true");
            }
            observer!.unobserve(img);
          }
        });
      },
      { rootMargin: "100px" }
    );
  }
  return observer;
}

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
  decoding?: "async" | "sync" | "auto";
}

export default function LazyImage({
  src,
  alt,
  className = "",
  placeholder = "/placeholder.svg",
  width,
  height,
  priority = false,
  sizes,
  srcSet,
  decoding = "async",
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);

  useEffect(() => {
    if (priority) return;

    const img = imgRef.current;
    if (!img) return;

    getObserver();

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          localObserver.unobserve(img);
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
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={decoding}
      className={className}
    />
  );
}
