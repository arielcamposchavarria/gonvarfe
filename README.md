# GonVar · Rondas de seguridad

Sistema de recorridos perimetrales y bitácoras para oficiales de seguridad, con 3 roles: `superAdmin`, `admin` y `guard`.

Esta fase deja lista la base del proyecto (arquitectura, autenticación mock, testing, CI) con datos quemados. La funcionalidad completa (CRUD de sitios/estaciones, bitácoras, backend real) se construye sobre esta base en las siguientes iteraciones.

## Arquitectura

Hexagonal (puertos y adaptadores). Ver las reglas completas en [CLAUDE.md](./CLAUDE.md).

```
src/domain          entidades, value objects y ports (sin dependencias de Next.js/React)
src/application     casos de uso (dependen solo de domain + ports inyectados)
src/infrastructure  adaptadores mock (datos quemados) + composition root (container.ts)
src/app             Next.js App Router — presentación, agrupada por rol
```

## Desarrollo

```bash
npm run dev          # servidor de desarrollo
npm run lint          # ESLint
npm run typecheck     # tipos (incluye next typegen)
npm run test           # pruebas unitarias/componentes (Vitest)
npm run test:coverage  # con reporte de cobertura
npm run e2e             # pruebas end-to-end (Playwright)
npm run build           # build de producción
```

## Usuarios de demostración

Datos quemados en `src/infrastructure/mock/data/`. El usuario coincide con el rol para facilitar el login mientras no hay funcionalidad real; contraseña `1234` para todos.

| Rol        | Usuario         | Contraseña | Estado   |
| ---------- | --------------- | ---------- | -------- |
| superAdmin | `superAdmin`    | `1234`     | Activo   |
| admin      | `admin`         | `1234`     | Activo   |
| guard      | `guard`         | `1234`     | Activo   |
| guard      | `guardInactivo` | `1234`     | Inactivo |

## CI

Cada PR corre lint, typecheck, tests, build, e2e, CodeQL y dependency review (`.github/workflows/`). Ver [CLAUDE.md](./CLAUDE.md) para la lista de checks recomendados como "required" en la protección de la rama `main`.
