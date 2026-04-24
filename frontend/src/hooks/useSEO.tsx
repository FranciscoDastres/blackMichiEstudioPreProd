import { Helmet } from "react-helmet-async";

const SITE_NAME = "Black Michi Estudio";
const DEFAULT_TITLE = "Black Michi Estudio | Figuras 3D Personalizadas";
const DEFAULT_DESC =
  "Black Michi Estudio — Figuras impresas en 3D, coleccionables únicos y decoraciones personalizadas. Modelos de cultura pop, anime y ciencia ficción.";
const BASE_URL = "https://blackmichiestudio.cl";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

interface SeoOptions {
  title?: string;
  description?: string;
  /** Path relativo, ej: "/productos/123" */
  path?: string;
  /** URL absoluta de la imagen para OG */
  image?: string;
  /** og:type, default "website" */
  type?: string;
  /** Objeto Schema.org para JSON-LD */
  jsonLd?: Record<string, unknown>;
}

export default function useSEO({
  title,
  description,
  path = "",
  image,
  type = "website",
  jsonLd,
}: SeoOptions = {}) {
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
