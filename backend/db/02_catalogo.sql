-- Tablas: categorias, productos, featured_productos, hero_images
-- Sincronizado con Supabase — 2026-04-04

CREATE SEQUENCE IF NOT EXISTS categorias_id_seq;
CREATE SEQUENCE IF NOT EXISTS productos_id_seq;
CREATE SEQUENCE IF NOT EXISTS featured_productos_id_seq;
CREATE SEQUENCE IF NOT EXISTS hero_images_id_seq;

-- ─── Categorias ───────────────────────────────────────────────────────────────

CREATE TABLE public.categorias (
  id           integer        NOT NULL DEFAULT nextval('categorias_id_seq'::regclass),
  nombre       character varying NOT NULL UNIQUE,
  descripcion  text,
  icono        character varying,
  color_fondo  character varying,
  color_icono  character varying,
  created_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);

-- ─── Productos ────────────────────────────────────────────────────────────────

CREATE TABLE public.productos (
  id                   integer   NOT NULL DEFAULT nextval('productos_id_seq'::regclass),
  titulo               character varying NOT NULL,
  slug                 character varying UNIQUE,
  precio               numeric   NOT NULL,
  precio_anterior      numeric,
  descripcion          text,
  descuento_porcentaje numeric,
  imagen_principal     character varying,
  imagenes_adicionales text[],
  categoria_id         integer,
  moneda               character varying DEFAULT 'CLP'::character varying,
  destacado            boolean   DEFAULT false,
  stock                integer   DEFAULT 5,
  activo               boolean   DEFAULT true,
  promedio_calificacion numeric  DEFAULT 0,
  total_valoraciones   integer   DEFAULT 0,
  created_at           timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at           timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT productos_pkey PRIMARY KEY (id),
  CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id)
);

-- ─── Featured productos ───────────────────────────────────────────────────────

CREATE TABLE public.featured_productos (
  id          integer NOT NULL DEFAULT nextval('featured_productos_id_seq'::regclass),
  producto_id integer NOT NULL UNIQUE,
  position    integer NOT NULL UNIQUE CHECK (position >= 1 AND position <= 3),
  CONSTRAINT featured_productos_pkey PRIMARY KEY (id),
  CONSTRAINT featured_productos_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);

-- ─── Hero images ──────────────────────────────────────────────────────────────

CREATE TABLE public.hero_images (
  id          integer NOT NULL DEFAULT nextval('hero_images_id_seq'::regclass),
  section     character varying NOT NULL UNIQUE,
  image_url   text    NOT NULL,
  title       character varying,
  subtitle    text,
  button_text character varying,
  categoria   character varying,
  created_at  timestamp without time zone DEFAULT now(),
  updated_at  timestamp without time zone DEFAULT now(),
  CONSTRAINT hero_images_pkey PRIMARY KEY (id)
);
