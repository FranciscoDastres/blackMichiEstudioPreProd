import { Helmet } from "react-helmet-async";

const SITE_NAME = "Black Michi Estudio";
const DEFAULT_TITLE = "Black Michi Estudio | Figuras 3D Personalizadas";
const DEFAULT_DESC =
  "Black Michi Estudio — Figuras impresas en 3D, coleccionables únicos y decoraciones personalizadas. Modelos de cultura pop, anime y ciencia ficción.";
const BASE_URL = "https://blackmichiestudio.cl";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

/**
 * Hook SEO que renderiza <Helmet> con meta tags, Open Graph y JSON-LD opcional.
 *
 * @param {Object} options
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {string} [options.path] - path relativo, ej: "/productos/123"
 * @param {string} [options.image] - URL absoluta de la imagen para OG
 * @param {string} [options.type] - og:type, default "website"
 * @param {Object} [options.jsonLd] - objeto Schema.org para JSON-LD
 */
export default function useSEO({
  title,
  description,
  path = "",
  image,
  type = "website",
  jsonLd,
} = {}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESC;
  const canonical = `${BASE_URL}${path}`;
  const ogImage = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="es_CL" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
