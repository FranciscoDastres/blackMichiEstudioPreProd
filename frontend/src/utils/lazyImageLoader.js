/**
 * ✅ Lazy load hover images - Cargar solo cuando se hace hover
 * Eliminalas 2,210 KiB de overhead innecesario
 */

export function initHoverImageLoading() {
    document.addEventListener('mouseover', (e) => {
        const hoverImg = e.target.closest('.group')?.querySelector('.hover-image');

        if (hoverImg && hoverImg.dataset.src && !hoverImg.src) {
            hoverImg.src = hoverImg.dataset.src;
            hoverImg.removeAttribute('data-src');
        }
    });
}

/**
 * Intersection Observer para cargar imágenes visibles
 */
export function initIntersectionObserver() {
    if (!window.IntersectionObserver) return;

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
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

    document.querySelectorAll('[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
