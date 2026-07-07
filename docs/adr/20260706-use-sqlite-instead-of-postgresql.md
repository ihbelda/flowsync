# Use SQLite instead of PostgreSQL

- Status: accepted
- Deciders: equipo FlowSync (máster AI4Devs)
- Date: 2026-07-06
- Tags: backend, database, infra

Technical Story: Elección del motor de base de datos relacional para el backend de FlowSync.

## Context and Problem Statement

FlowSync es la aplicación del máster AI4Devs. El backend en AdonisJS 7
necesita un motor de base de datos relacional para persistir sus datos, tanto
en desarrollo local como en el entorno de la aplicación. ¿Qué motor de base
de datos debemos usar?

## Decision Drivers

- Minimizar el overhead de infraestructura en el entorno de desarrollo local
  (sin necesidad de levantar un servidor de base de datos aparte).
- Soporte nativo por parte de Lucid ORM, el ORM usado en el backend AdonisJS.
- Facilidad de onboarding para el alumnado del máster, que trabaja en
  entornos locales heterogéneos.

## Considered Options

- SQLite + `better-sqlite3`
- PostgreSQL

## Decision Outcome

Chosen option: "SQLite + `better-sqlite3`", porque no requiere infraestructura
adicional en desarrollo local (la base de datos es un único fichero) y Lucid
ORM lo soporta de forma nativa sin configuración extra.

### Positive Consequences

- Cero overhead de infraestructura en desarrollo local: no hace falta
  instalar, configurar ni levantar un servidor de base de datos.
- Onboarding más rápido: clonar el repo y ejecutar las migraciones es
  suficiente para tener una base de datos funcional.
- La base de datos es un único fichero (`backend/tmp/db.sqlite3`), fácil de
  inspeccionar, resetear (`migration:fresh`) o versionar en fixtures.

### Negative Consequences

- Sin soporte para arrays nativos en columnas, a diferencia de PostgreSQL
  (`text[]`, `jsonb`, etc.), lo que obliga a modelar esos casos con tablas
  relacionadas o campos serializados.
- Sin soporte real para escritura concurrente a escala: SQLite serializa las
  escrituras a nivel de fichero, por lo que no es apto para cargas de
  producción con múltiples escritores simultáneos.
- Migrar a otro motor en el futuro (p. ej. PostgreSQL) requeriría revisar
  cualquier código que dependa de particularidades de SQLite.

## Pros and Cons of the Options

### SQLite + `better-sqlite3`

- Good, porque no requiere infraestructura adicional en desarrollo local.
- Good, porque Lucid ORM lo soporta de forma nativa.
- Good, porque simplifica el onboarding en un contexto formativo (máster).
- Bad, porque no soporta arrays nativos en columnas.
- Bad, porque no soporta escritura concurrente a escala.

### PostgreSQL

- Good, porque soporta tipos de datos avanzados (arrays, `jsonb`, etc.).
- Good, porque soporta escritura concurrente a escala y es apto para
  producción.
- Bad, porque requiere levantar y mantener un servidor de base de datos, lo
  que añade overhead de infraestructura en desarrollo local.
