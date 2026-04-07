# 🧭 Flujo Ideal de Branches en Git

Este documento describe un **workflow de Git limpio, profesional y fácil de mantener**, ideal para proyectos personales o equipos pequeños/medianos.

---

## 🌳 Branches principales (protegidas)

### 🔵 `main`

* Código **en producción**
* Siempre estable
* ❌ No se hacen commits directos
* ✅ Solo recibe `merge` desde `develop` o `hotfix/*`

---

### 🟢 `develop`

* Rama de **integración**
* Contiene el código en desarrollo
* Debe **compilar y correr siempre**
* ❌ No se hacen features directamente aquí

---

## 🌿 Branches de trabajo

### 🟡 `feature/*`

Para desarrollar **funcionalidades o componentes específicos**.

**Ejemplos:**

```text
feature/login-form
feature/product-card
feature/api-auth
feature/docker-setup
```

**Reglas:**

* Se crean desde `develop`
* Se mergean a `develop`
* Se eliminan después del merge

---

## 🚑 Branches especiales

### 🔴 `hotfix/*`

Para **correcciones urgentes en producción**.

```text
hotfix/fix-payment-bug
```

**Flujo:**

* Se crean desde `main`
* Se mergean a:

  * `main`
  * `develop`

---

### 🧪 (Opcional) `release/*`

Solo recomendado para proyectos grandes.

```text
release/v1.2.0
```

Usado para:

* QA
* pruebas finales
* versionado

---

## 🔄 Flujo de trabajo diario

### 1️⃣ Crear una feature

```bash
git checkout develop
git pull
git checkout -b feature/product-card
```

---

### 2️⃣ Trabajar y commitear

```bash
git add .
git commit -m "feat: product card component"
```

---

### 3️⃣ Finalizar la feature

```bash
git checkout develop
git pull
git merge feature/product-card
git branch -d feature/product-card
```

---

### 4️⃣ Pasar a producción

```bash
git checkout main
git merge develop
git tag v1.0.0
git push --tags
```

---

## 📝 Convención de commits (recomendada)

```text
feat: nueva funcionalidad
fix: corrección de bug
refactor: limpieza de código
docs: documentación
chore: configuración, dependencias, scripts
```

**Ejemplo:**

```bash
git commit -m "fix: prevent crash when user is null"
```

---

## 🚫 Errores comunes a evitar

* ❌ Trabajar directamente en `main`
* ❌ Branches de feature demasiado grandes
* ❌ Branches que nunca se eliminan
* ❌ Commits genéricos tipo "update"

---

## 🎯 Flujo recomendado (resumen)

```text
main
└── develop
    ├── feature/*
    └── hotfix/*
```

✔️ Simple
✔️ Escalable
✔️ Profesional

---

> Este flujo es ideal para proyectos personales, startups o equipos pequeños. Se puede extender fácilmente con CI/CD o revisiones por Pull Request.
