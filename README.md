# TGR · True Gamers Reviews

Plataforma web de reseñas de videojuegos. Cada juego muestra **tres calificaciones independientes**: la oficial de TGR, el promedio de revistas especializadas (convertido a 5 estrellas) y el promedio de la comunidad.

Proyecto final de **Diseño de Interfaces** · Universidad Marista de Mérida.

- Análisis: `proyecto_srs.pdf`
- Diseño (arquitectura, flujos, wireframes, sistema de diseño): `proyecto_diseño.pdf`
- Prototipo en Figma: https://www.figma.com/design/mObYzvsQU5N0H4yPkS4IAR
- Pruebas: `proyecto_plan_ejecución_pruebas.pdf`
- Repositorio: https://github.com/SangonapouSchool/tgr-true-gamers-reviews

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, Tailwind CSS 4, Svelte 5 |
| Backend | SvelteKit 3 sobre Node.js ≥ 22.17 |
| Base de datos | SQLite con el módulo nativo `node:sqlite` |
| Pruebas | Vitest 5 (unitarias e integración) · playwright-core + Microsoft Edge (E2E) |

## Tutorial: cómo ejecutar todo paso a paso

### 1. Requisitos

| Programa | Versión | Para qué | Cómo verificar |
|---|---|---|---|
| [Node.js](https://nodejs.org/) | **22.17 o mayor** (se recomienda la LTS más reciente) | Ejecutar la app (incluye `npm` y SQLite) | `node -v` |
| [Git](https://git-scm.com/) | cualquiera | Descargar el repositorio | `git --version` |
| Microsoft Edge o Google Chrome | cualquiera reciente | Ver la app y correr las pruebas E2E | — |

> No hace falta instalar SQLite ni ninguna base de datos: la app usa el módulo `node:sqlite` que ya viene con Node.js.

### 2. Descargar el proyecto

```bash
git clone https://github.com/SangonapouSchool/tgr-true-gamers-reviews.git
cd tgr-true-gamers-reviews
```

Si lo recibiste en el zip `ProyectoFinal_EquipoX.zip`, descomprímelo y abre una terminal dentro de la carpeta `codigo/`.

### 3. Instalar dependencias

```bash
npm install
```

Sólo se hace una vez (o cuando cambie `package.json`). Crea la carpeta `node_modules/`.

### 4. Crear la base de datos con datos de demostración

```bash
npm run seed
```

Crea `data/tgr.db` con 16 videojuegos, 35 reseñas, 55 calificaciones, comentarios y las cuentas de prueba de la tabla de abajo. Puedes volver a ejecutarlo cuando quieras **regresar la base de datos a su estado inicial** (borra lo que hayas agregado).

### 5. Levantar la aplicación

```bash
npm run dev
```

Abre **http://localhost:5173** en el navegador. Deja esa terminal abierta mientras uses la app; para detenerla presiona `Ctrl + C`.

### 6. Recorrido sugerido (demo)

1. **Visitante:** en el inicio escribe `hades` en el buscador → clic en *Buscar* → clic en el juego. Estás en la reseña en 2 clics.
2. En la reseña revisa las **tres calificaciones** y da clic en *Ver desglose por revista*.
3. Abre **Chrono Trigger**: la comunidad muestra *“Calificaciones insuficientes”* (menos de 5 votos).
4. **Usuario:** entra con `ana@tgr.test` / `usuario12345`, califica un juego, cámbiale la calificación, comenta y agrégalo a favoritos. Revisa tu **perfil**.
5. **Editor de revista:** cierra sesión y entra con `pixelpress@tgr.test` / `revista12345`. En *Street Fighter 6* usa *Reseñar como PixelPress*, elige escala *De 0 a 10* y escribe `9`: verás *“Se mostrará como 4.5 / 5”*.
6. **Editor TGR:** con `editor@tgr.test` / `editor12345` ve a *Panel editor* y escribe una reseña oficial; usa *Vista previa* para ver el formato.
7. **Administrador:** con `admin@tgr.test` / `admin12345` ve a *Administración*: agrega un juego, suspende una cuenta en *Usuarios y roles* y oculta un comentario en *Moderación*.
8. **Usuario suspendido:** entra con `troll@tgr.test` / `usuario12345`: puedes leer pero no calificar ni comentar, y en tu perfil verás la notificación de moderación.
9. **Móvil:** reduce la ventana del navegador (o usa las herramientas de desarrollador, `F12` → modo dispositivo) para ver el diseño responsivo.

### 7. Correr las pruebas

**Unitarias y de integración** (no necesitan la app encendida):

```bash
npm test
```

Deben aparecer **42 pruebas aprobadas**. Usan una base de datos en memoria, así que no modifican `data/tgr.db`.

**Pruebas funcionales de extremo a extremo (E2E)**: abren un navegador real, recorren la app y toman capturas.

1. En una terminal, reinicia los datos y levanta la app:
   ```bash
   npm run seed
   npm run dev
   ```
2. En **otra** terminal (dentro de la misma carpeta):
   ```bash
   node scripts/e2e-evidencia.js
   ```

Deben aparecer **15/15 casos aprobados**. Las capturas y los resultados (`resultados-e2e.json`) se guardan en `../entrega/evidencia/`. Opciones:

| Variable | Para qué | Ejemplo |
|---|---|---|
| `BROWSER_CHANNEL` | Usar Chrome en lugar de Edge | `BROWSER_CHANNEL=chrome` |
| `EVIDENCE_DIR` | Guardar las capturas en otra carpeta | `EVIDENCE_DIR=./evidencia` |
| `BASE_URL` | Probar otra dirección | `BASE_URL=http://localhost:3000` |

En PowerShell las variables se escriben así: `$env:BROWSER_CHANNEL="chrome"; node scripts/e2e-evidencia.js`.

> Las pruebas E2E crean una cuenta, reseñas y comentarios. Al terminar ejecuta `npm run seed` para regresar a los datos de demostración.

### 8. Versión de producción

```bash
npm run build
npm start
```

Compila la app en `build/` y la sirve en **http://localhost:3000** (cámbialo con la variable `PORT`). La base de datos sigue siendo `data/tgr.db` (o la ruta en la variable `TGR_DB`).

### 9. Problemas comunes

| Problema | Solución |
|---|---|
| `No such built-in module: node:sqlite` o errores al arrancar | Tu Node.js es muy viejo. Instala la versión 22.17 o mayor y vuelve a correr `npm install`. |
| `Port 5173 is already in use` | Ya hay otra copia corriendo. Ciérrala con `Ctrl + C` o usa `npm run dev -- --port 5174`. |
| En PowerShell: *“la ejecución de scripts está deshabilitada”* al usar `npm` | Ejecuta una vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, o usa la terminal *Símbolo del sistema* (cmd) o Git Bash. |
| La página no muestra juegos | No se creó la base de datos: ejecuta `npm run seed`. |
| Quiero empezar desde cero | `npm run seed` (con la app encendida o apagada). |
| La prueba E2E dice que no encuentra `msedge` | Usa Chrome: `BROWSER_CHANNEL=chrome node scripts/e2e-evidencia.js`. |
| Las pruebas E2E fallan con *timeout* | Revisa que la app esté corriendo en http://localhost:5173 y que hayas ejecutado `npm run seed` antes. |

### Resumen de comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run seed` | Crea o reinicia la base de datos de demostración |
| `npm run dev` | Levanta la app en modo desarrollo (puerto 5173) |
| `npm test` | Pruebas unitarias y de integración |
| `node scripts/e2e-evidencia.js` | Pruebas E2E + capturas (requiere la app encendida) |
| `npm run build` y `npm start` | Compila y sirve la versión de producción (puerto 3000) |

## Cuentas de prueba

| Correo | Contraseña | Rol |
|---|---|---|
| admin@tgr.test | admin12345 | Administrador |
| editor@tgr.test | editor12345 | Editor de TGR (reseñas oficiales) |
| pixelpress@tgr.test | revista12345 | Editor de la revista PixelPress (escala /10) |
| modoretro@tgr.test | revista12345 | Editor de la revista Modo Retro (escala /100) |
| controltotal@tgr.test | revista12345 | Editor de la revista Control Total (escala /5) |
| ana@tgr.test | usuario12345 | Usuario registrado |
| troll@tgr.test | usuario12345 | Usuario suspendido (sólo lectura) |

Son datos ficticios de demostración: las revistas y los textos de las reseñas fueron escritos para este proyecto.

**Portadas.** Los datos de demostración enlazan la portada oficial de cada juego desde su artículo de Wikipedia (se necesita internet para verlas). Las imágenes no se copian al repositorio; pertenecen a sus editoras y se usan sólo con fines educativos. Si un juego no tiene portada o la imagen no carga, se muestra una portada generada con un degradado de color. El administrador puede subir o cambiar la portada de cualquier juego en *Administración › Videojuegos › Editar* (archivo PNG/JPG/WEBP o dirección https).

## Estructura

```
src/
  app.css              tokens del sistema de diseño (Tailwind @theme)
  hooks.server.js      carga la sesión en cada petición
  lib/
    scoring.js         RN1, RN3, RN5: conversión de escalas y promedios
    permissions.js     permisos por rol (RN7)
    validation.js      validaciones (RNF5)
    markdown.js        formato seguro de reseñas (RF5)
    components/        GameCard, ScoreBadge, ReviewForm, GameForm…
    server/            db.js (esquema), auth.js, repo.js (reglas de negocio), uploads.js
  routes/
    /                  inicio
    /juegos            catálogo con búsqueda y filtros
    /juegos/[slug]     reseña, calificar, comentar, favoritos
    /registro /login /logout /perfil
    /editor            panel de reseñas (editores y admin)
    /admin             juegos, usuarios y roles, moderación
scripts/               seed.js, seed-data.js, e2e-evidencia.js
tests/                 unit.test.js, integration.test.js
```

## Requerimientos cubiertos

RF1–RF12, RNF1–RNF6 y RN1–RN8 del SRS. La matriz de trazabilidad (requerimiento → historia → pantalla → prueba) está en `proyecto_srs.pdf`, sección 6.
