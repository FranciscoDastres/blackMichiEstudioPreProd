/**
 * ✅ Lazy load hover images - Cargar solo cuando se hace hover
 * Eliminalas 2,210 KiB de overhead innecesario
 */

export function initHoverImageLoading(): void {
  document.addEventListener('mouseover', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const hoverImg = target.closest('.group')?.querySelector('.hover-image') as HTMLImageElement | null;

    if (hoverImg && hoverImg.dataset.src && !hoverImg.src) {
      hoverImg.src = hoverImg.dataset.src;
      hoverImg.removeAttribute('data-src');
    }
  });
}

/**
 * Intersection Observer para cargar imágenes visibles
 */
export function initIntersectionObserver(): void {
  if (!window.IntersectionObserver) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src && !img.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px'
  });

  document.querySelectorAll<HTMLImageElement>('[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}
