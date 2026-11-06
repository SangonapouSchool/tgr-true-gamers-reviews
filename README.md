# TGR · True Gamers Reviews

Plataforma web de reseñas de videojuegos. Cada juego muestra **tres calificaciones independientes**: la oficial de TGR, el promedio de revistas especializadas (convertido a 5 estrellas) y el promedio de la comunidad.

Proyecto final de **Diseño de Interfaces** · Universidad Marista de Mérida.

- Análisis: `proyecto_srs.pdf`
- Diseño (arquitectura, flujos, wireframes, sistema de diseño): `proyecto_diseño.pdf`
- Prototipo en Figma: https://www.figma.com/design/mObYzvsQU5N0H4yPkS4IAR
- Pruebas: `proyecto_plan_ejecución_pruebas.pdf`

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, Tailwind CSS 4, Svelte 5 |
| Backend | SvelteKit 3 sobre Node.js ≥ 22.17 |
| Base de datos | SQLite con el módulo nativo `node:sqlite` |
| Pruebas | Vitest 5 (unitarias e integración) · playwright-core + Microsoft Edge (E2E) |

## Cómo ejecutarlo

```bash
npm install
npm run seed      # crea data/tgr.db con datos de demostración
npm run dev       # http://localhost:5173
```

Producción:

```bash
npm run build
npm start         # servidor Node en el puerto 3000 (variable PORT)
```

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

Son datos ficticios de demostración: las revistas y los textos de las reseñas fueron escritos para este proyecto, y las portadas se generan con degradados (sin arte con derechos de autor).

## Pruebas

```bash
npm test                          # 42 pruebas unitarias y de integración
npm run seed && npm run dev       # en otra terminal
node scripts/e2e-evidencia.js     # 15 pruebas E2E + capturas en ../entrega/evidencia
```

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
