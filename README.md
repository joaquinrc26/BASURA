# BASURA — tienda underground

Tienda editorial para prendas recuperadas e intervenidas. La compra se coordina exclusivamente por WhatsApp: el sitio no cobra, no confirma ventas y no reserva ni descuenta stock.

## Stack

- Next.js App Router, React y TypeScript.
- PostgreSQL en Neon, Prisma y migraciones versionadas.
- Cloudinary para las fotografías; la base guarda URL e identificador, nunca el archivo.
- Sesión administrativa propia firmada con `jose`, contraseña bcrypt y una cuenta definida en variables de entorno.
- Vercel para el hosting. El carrito se conserva en `localStorage`.

El catálogo empieza vacío de manera intencional. No hay prendas, fotos, categorías, precios ni testimonios inventados.

## Requisitos

- Node.js 20.9 o superior (se recomienda Node 22 LTS para Vercel).
- Una base PostgreSQL de Neon.
- Una cuenta Cloudinary para activar la carga de fotos.

## Desarrollo local (PowerShell)

```powershell
npm install
Copy-Item .env.example .env
```

Completá `.env` con las variables descritas abajo. Para generar `AUTH_SECRET`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Generá el hash de la contraseña compartida inicial. El texto se ingresa sin eco en la terminal; guardá el hash como `ADMIN_PASSWORD_HASH` en `.env`:

```powershell
npm run admin:hash
```

Para aplicar la migración inicial, usá la conexión directa de Neon (no el pooler):

```powershell
$runtimeUrl = $env:DATABASE_URL
$env:DATABASE_URL = $env:DATABASE_URL_UNPOOLED
npm run db:migrate:deploy
$env:DATABASE_URL = $runtimeUrl
```

Luego iniciá el sitio:

```powershell
npm run dev
```

Abrí `http://localhost:3000`. La administración está en `http://localhost:3000/admin`.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL pooled de Neon para las solicitudes serverless. |
| `DATABASE_URL_UNPOOLED` | URL directa de Neon para migraciones y tareas administrativas. El comando Prisma de migración toma `DATABASE_URL`, por eso se la asigna temporalmente a esta URL. |
| `AUTH_SECRET` | Secreto aleatorio de al menos 32 caracteres para firmar la sesión. |
| `ADMIN_USERNAME` | Usuario de la única cuenta inicial. No existe registro público. |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt generado con `npm run admin:hash`; nunca guardar la contraseña en el repositorio. |
| `CLOUDINARY_CLOUD_NAME` | Nombre de la cuenta Cloudinary. |
| `CLOUDINARY_API_KEY` | Clave de API Cloudinary, usada solo en el servidor. |
| `CLOUDINARY_API_SECRET` | Secreto de API Cloudinary, usado solo en el servidor. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número internacional en dígitos, sin `+` ni espacios. El valor confirmado es `5492215487930` (221 548-7930). |
| `NEXT_PUBLIC_SITE_URL` | URL canónica pública, por ejemplo `https://basura.example`. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Instagram oficial: `https://www.instagram.com/basura_lp/`. |

No antepongas `NEXT_PUBLIC_` a credenciales, URLs de base de datos ni secretos.

## Neon y migraciones

1. Creá un proyecto Neon y una rama separada para desarrollo y producción.
2. Copiá la URL pooled a `DATABASE_URL` y la URL directa a `DATABASE_URL_UNPOOLED`.
3. Antes de desplegar una versión que incorpora cambios de esquema, aplicá `prisma migrate deploy` usando la URL directa como `DATABASE_URL`.
4. Las migraciones de `prisma/migrations/` son versionadas y aditivas para la primera instalación. No se ejecuta `migrate reset` ni se borran datos.
5. Ejecutá `npm run db:generate` para regenerar el cliente después de cambios al esquema.
6. La migración `20261013180000_site_content` agrega los textos editables del sitio; aplicala antes de desplegar esta versión.
6. La migración `20261013145000_site_content` agrega los textos editables del sitio; aplicala antes de desplegar esta versión.

El proyecto no conecta ni migra una base remota hasta que se configuren las variables.

## Cloudinary

La ruta administrativa de carga requiere los tres valores de Cloudinary. Valida sesión y origen, acepta JPEG/PNG/WebP/AVIF de hasta 4 MB, verifica firma binaria, genera un identificador aleatorio y transforma las imágenes para limitar dimensiones y optimizar entrega. El límite deja margen bajo el tamaño máximo de cuerpo de las funciones serverless de Vercel. El secreto nunca llega al navegador. Una prenda admite hasta cinco fotos y la primera es la principal.

Si se quita una foto existente del formulario, su eliminación en Cloudinary se completa al guardar la prenda; una foto subida pero no guardada puede eliminarse desde el formulario. Si falla la limpieza remota, el panel muestra una advertencia explícita.

## Configurar Vercel

1. Importá el repositorio en Vercel y elegí Node.js 22.
2. Cargá las variables de `.env.example` en los entornos necesarios; usá valores y ramas distintas para Preview y Production.
3. Ejecutá la migración de Neon con su URL directa antes de desplegar el código que depende del esquema.
4. El comando `npm run build` genera Prisma Client y compila Next.js.
5. Configurá `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER` y `NEXT_PUBLIC_INSTAGRAM_URL` para cada entorno. Los enlaces confirmados son WhatsApp 221 548-7930 e Instagram @basura_lp.

## Tienda y administración

- `/`: manifiesto, prendas destacadas (si existen), reconocimiento de La Plata Sports y acceso a la tienda.
- `/emparchadas`: catálogo publicado con búsqueda, categoría, talle, disponibilidad, precio máximo y ordenamiento.
- `/emparchadas/[slug]`: detalle, galería, variantes, stock, materiales y cuidados cuando se informan.
- `/basura-es-movimiento`: historia editorial del proyecto.
- `/admin`: inicio de sesión e inventario. Crear, editar, publicar, ocultar y eliminar prendas; mantener categorías y fotos; editar títulos, bajadas y descripciones de portada, catálogo y movimiento desde “Textos del sitio”.

Al finalizar la compra, un endpoint del servidor vuelve a leer los productos publicados, precios y stock. Solo después construye el mensaje que abre `wa.me`. El enlace no significa que el cliente haya enviado el mensaje ni que BASURA haya confirmado disponibilidad, pago, envío o venta. El stock no se descuenta al abrir WhatsApp.

## Pruebas y validaciones

```powershell
npm test
npm run lint
npm run typecheck
npm run build
```

Las pruebas unitarias cubren el armado del pedido de WhatsApp, varios artículos, subtotales, total, formato de moneda y slugs. Las operaciones reales con Neon y Cloudinary requieren variables configuradas y no se consideran verificadas por las pruebas locales.

Las tres fotografías editoriales optimizadas de La Plata Sports se derivan de los originales en `Desfile-Basura/`; esos originales se conservan intactos. Las prendas de las carpetas de colección no se publican como inventario hasta que el equipo cargue precio, stock y variantes en el panel.

El panel incluye una sección de textos agrupada por página. Los cambios se validan, se guardan en la tabla `SiteContent` y se reflejan en la tienda sin editar código.
