@AGENTS.md

# Arquitectura

Este proyecto usa arquitectura hexagonal (puertos y adaptadores). La dirección de dependencias es estricta y va en un solo sentido:

`presentation (src/app, src/components) → application (src/application) → domain (src/domain)`, con `infrastructure (src/infrastructure)` implementando los `ports` que define `domain`.

- **`src/domain`**: entidades, value objects y `ports` (interfaces). No importa nada de `application`, `infrastructure` ni `src/app`. Cero dependencias de Next.js/React.
- **`src/application`**: casos de uso, uno por acción de negocio. Solo dependen de `domain` y reciben sus dependencias (`ports`) inyectadas por parámetro — nunca importan un adaptador concreto de `infrastructure`.
- **`src/infrastructure`**: adaptadores que implementan los `ports` del dominio. Hoy solo existen adaptadores mock (`src/infrastructure/mock/`) con datos quemados; al conectar un backend real se agregan adaptadores nuevos ahí sin tocar `domain` ni `application`.
- **`src/infrastructure/container.ts`**: composition root. Es el único archivo que conecta casos de uso con adaptadores concretos. Las páginas y componentes de `src/app` importan `container`, nunca un repositorio o caso de uso directamente.
- **Datos quemados**: viven únicamente en `src/infrastructure/mock/data/`. Nunca hardcodear datos de ejemplo dentro de componentes, páginas o casos de uso.
- **Control de acceso por rol**: vive en `src/proxy.ts` (reemplaza a `middleware.ts`, deprecado en Next 16 — ver `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`) + `src/lib/auth/` + los `layout.tsx` de cada grupo de rutas por rol (`src/app/guard`, `src/app/admin`, `src/app/superadmin`). No agregar checks de rol ad hoc dentro de páginas individuales.
- **Server actions**: Proxy no protege las Server Functions de forma fiable (no son rutas separadas en su cadena de ejecución; un cambio de `matcher` puede dejarlas sin cobertura silenciosamente). Cada server action que mute datos debe validar sesión/rol por su cuenta, como hace `requireGuard()` en `src/app/guard/actions.ts` — no depender solo de Proxy o del layout.
- **Validación de formularios**: con `zod`, esquemas en `src/lib/validation/`, reutilizados tanto en el cliente (mensajes de error) como en las server actions.

# Testing

- **Regla obligatoria**: todo cambio que agregue o modifique comportamiento debe incluir o actualizar sus pruebas en el mismo cambio. Un cambio sin sus pruebas correspondientes no se considera terminado.
- Unitarias/componentes con **Vitest** + React Testing Library. Casos de uso del dominio (ventanas de tiempo, reglas de negocio) y componentes con lógica no trivial siempre deben tener prueba.
- No hay end-to-end (Playwright se retiró: dependía de loguearse contra el backend real, y no hay una base de datos efímera para CI). Cubrir flujos de seguridad (control de acceso por rol, usuarios desactivados, ventanas de tiempo de escaneo) con pruebas unitarias/de casos de uso en su lugar.
- Los tests unitarios/componentes viven junto al archivo que prueban (`archivo.ts` + `archivo.test.ts`), no en una carpeta paralela.
- Comandos: `npm run test` (unitarias), `npm run test:coverage`.

# CI

Cada PR corre lint, typecheck, tests unitarios y build (ver `.github/workflows/ci.yml`), además de CodeQL y dependency review. Un PR no debe mergearse con checks en rojo.

# No modificar datos de la base de datos

El backend real (gonvarbe) usa la base de datos de Railway, no una de prueba local. **No crear, editar ni borrar registros contra el backend real** (llamadas sueltas a los endpoints solo para "probar y limpiar después", scripts ad hoc, etc.) sin permiso explícito del usuario para esa acción puntual — esto aplica incluso a datos que Claude mismo haya creado momentos antes en la misma conversación: pedir confirmación antes de borrarlos. Para verificar un flujo, preferir los tests (Vitest/Playwright) o pedirle al usuario que cree/borre los datos de prueba él mismo.
