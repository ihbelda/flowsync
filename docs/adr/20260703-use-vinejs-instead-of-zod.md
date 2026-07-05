# Use VineJS instead of Zod

- Status: accepted
- Date: 2026-07-03
- Tags: backend, validation

## Context and Problem Statement

El backend de FlowSync (AdonisJS 7) necesita validar los datos de entrada de
las peticiones HTTP antes de que lleguen a los controllers. ¿Qué librería de
validación debemos usar?

## Decision Drivers

- Minimizar dependencias y código de integración adicional.
- Soporte e integración nativos con AdonisJS 7 y con Lucid ORM.
- Consistencia con las convenciones del starter kit (validators en
  `app/validators/`).

## Considered Options

- VineJS
- Zod

## Decision Outcome

Chosen option: "VineJS", porque AdonisJS 7 lo incluye de forma nativa y tiene
integración directa con Lucid, mientras que Zod habría requerido adaptadores
manuales para cubrir esa misma integración.

### Positive Consequences

- No añade dependencias externas: VineJS ya forma parte del starter kit de
  AdonisJS 7.
- Integración directa con Lucid (p. ej. reglas de validación que consultan la
  base de datos, como `unique` o `exists`, sin código adicional).
- Consistencia con las convenciones y la documentación oficial de AdonisJS.

### Negative Consequences

- El equipo asume el ecosistema y la curva de aprendizaje de VineJS en lugar
  de usar Zod, que es más popular y tiene mayor adopción fuera del ecosistema
  AdonisJS.
- Menor portabilidad de los schemas de validación fuera del backend
  AdonisJS (p. ej. no se pueden compartir directamente con el frontend).

## Pros and Cons of the Options

### VineJS

- Good, porque viene integrado de forma nativa en AdonisJS 7.
- Good, porque tiene integración directa con Lucid (reglas como `unique`,
  `exists`, etc.).
- Good, porque sigue las convenciones ya establecidas por el starter kit.
- Bad, porque tiene menor adopción y comunidad fuera del ecosistema AdonisJS.

### Zod

- Good, porque es una librería de validación muy popular, con gran adopción
  en el ecosistema TypeScript.
- Good, porque permite compartir schemas entre backend y frontend.
- Bad, porque habría requerido adaptadores manuales para integrarse con
  AdonisJS y Lucid, sin soporte nativo de reglas como `unique` o `exists`.

## Links

- Relates to [Use Markdown Architectural Decision Records](20260703-use-markdown-architectural-decision-records.md)
