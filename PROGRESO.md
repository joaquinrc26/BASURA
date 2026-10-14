# BASURA — Registro de avance

Archivo para retomar el trabajo. No contiene secretos (ni contraseñas, ni hashes, ni claves, ni URLs de base de datos).

## Estado actual (13/10/2026, cierre del día)
- **Sitio online:** https://basura-swart.vercel.app (Vercel, rama `main` de https://github.com/joaquinrc26/BASURA, se despliega solo con cada push).
- Base de datos Neon nueva (`neon-erin-flower`) con las 2 migraciones aplicadas y `DATABASE_URL` gestionada por la integración de Vercel.
- Cloudinary configurado (3 variables).
- Variables de admin creadas en Vercel (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`) y `NEXT_PUBLIC_*` de WhatsApp, Instagram y URL del sitio.
- Páginas públicas y `/admin` responden 200.

## Qué hay implementado
- Portada editorial punk/fanzine, manifiesto, historia de La Plata Sports y 3 fotos optimizadas (`public/images/editorial/`).
- Catálogo `/emparchadas` con filtros y detalle con hasta 5 fotos, variantes y stock.
- Carrito en el navegador; el cierre es por WhatsApp (el servidor revalida precios y stock). No hay pagos ni pedidos guardados.
- Botones flotantes de Instagram `@basura_lp` y WhatsApp `2215487930`.
- `/admin`: prendas, categorías, variantes, stock, fotos, destacadas/agotadas, inventario y **Textos del sitio** (tabla `SiteContent`).
- Fotos admitidas: JPG, PNG, WebP y AVIF, hasta 4 MB c/u, 5 por prenda.

## Diseño (hecho hoy)
- Paleta: blanco, negro, rojo, amarillo y turquesa (variables `--paper`, `--ink`, `--red`, `--acid`, `--teal` al inicio de `src/app/globals.css`).
- Tipografías (cargadas en `src/app/layout.tsx`):
  - Títulos: **Permanent Marker** (estilo marcador).
  - Título gigante "BASURA" de la portada: **Rubik Dirt** (variable `--font-title`).
  - Textos chicos: **Special Elite** (máquina de escribir).
  - Cuerpo: **Archivo**.
- Tamaño del título de la portada: clase `.hero-wordmark` en `globals.css`. Quedó aprobado; la "A" final no se corta gracias a `white-space: nowrap` y `padding-right`. Hay reglas de celular más abajo en el mismo archivo que usan `13vw`.

## Qué pasó hoy (para no repetir errores)
- Las tablas no existían en producción porque la `DATABASE_URL` de Vercel apuntaba a otro endpoint de Neon que el migrado. Se recreó Neon y se reconectó con la integración de Vercel.
- Las migraciones se corren **a mano** desde la PC con la URL directa (sin `-pooler`); Vercel usa la URL pooled.
- Había una carpeta vacía `prisma/migrations/20261013145000_site_content` (artefacto de OneDrive) que causaba el error P3015; se movió fuera del proyecto.
- El mensaje "Falta configurar el acceso" del admin sale si falta alguna de las 3 variables de admin o si `AUTH_SECRET` tiene menos de 32 caracteres.
- Las credenciales de admin y el `AUTH_SECRET` de hoy se mostraron en el chat: **cambiarlos por unos propios** (ver abajo).

## Pendientes recomendados (en orden)
1. **Cambiar las credenciales de admin:** correr `npm run admin:hash` en PowerShell con una contraseña propia, reemplazar `ADMIN_PASSWORD_HASH` en Vercel, generar un `AUTH_SECRET` nuevo (64 caracteres aleatorios), Redeploy.
2. **Vercel → Settings → Deployment Protection:** poner Vercel Authentication en Disabled para que el público vea la tienda.
3. **Probar en vivo:** entrar a `/admin`, crear categoría y prenda de prueba con fotos, publicar, mirar `/emparchadas`, armar el mensaje de WhatsApp, editar un texto del sitio y borrar la prueba.
4. **Cargar las prendas reales** (precio, stock, variantes y fotos) desde `/admin`.
5. Revisar el sitio en celular (el diseño es mobile-first en el uso real).
6. Si compran un dominio propio: actualizar `NEXT_PUBLIC_SITE_URL` en Vercel y redeploy.

## Cómo hacer cambios a futuro
- **Textos:** desde `/admin` → "Textos del sitio" (sin tocar código).
- **Productos y fotos:** desde `/admin`.
- **Colores y tipografías:** `src/app/globals.css` y `src/app/layout.tsx`.
- **Cambios de código:** probar con `npm run dev`, después `git add`, `git commit` y `git push origin main`; Vercel despliega solo.
- **Cambios en la base de datos (tablas nuevas):** crear una migración con `npx prisma migrate dev` en local contra una base de pruebas, subir el código y aplicar en producción con `npx prisma migrate deploy` usando la URL directa. Nunca `migrate reset` en producción.
- Si cambian variables en Vercel, hacer Redeploy (las `NEXT_PUBLIC_*` se fijan al compilar).

## Notas útiles
- Tras 5 intentos fallidos de login, bloqueo de 15 minutos.
- Auditoría de npm: producción 0 vulnerabilidades; 5 avisos altos solo en dependencias de desarrollo (sin parche).
- Si el build local falla con `EPERM` en Windows/OneDrive, renombrar la carpeta `.next` y reintentar.
- Nunca pegues contraseñas, API Secret, hashes ni URLs completas de base de datos en el chat.
