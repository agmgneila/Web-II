# Web II — Soluciones

Soluciones organizadas con la misma estructura que el repositorio de
enunciados de la asignatura.

## Estructura

- `ejercicios/T1` a `ejercicios/T10`: ejercicios independientes por tema
  (el repositorio docente no publica un ejercicio T7).
- `practicas/intermedia`: API de usuarios de BildyApp.
- `practicas/final`: API completa de digitalización de albaranes.

Cada carpeta contiene su propio `README.md`, `package.json`, instrucciones de
ejecución y variables necesarias en `.env.example`.

## Requisitos generales

- Node.js 22 o posterior.
- MongoDB para los proyectos que usan Mongoose.
- PostgreSQL/Supabase para el ejercicio T9.

Los secretos nunca se incluyen en el repositorio. Copia el `.env.example` de
cada proyecto a `.env` y completa únicamente las credenciales del entorno de
desarrollo.

## Verificación

- T1–T4 se verifican localmente sin servicios externos.
- T5, T6, T8, T10 y las prácticas usan MongoDB.
- T9 tiene su migración aplicada en Supabase/PostgreSQL.
- La práctica final supera el 70 % de cobertura exigido y dispone de un workflow
  de GitHub Actions en la raíz del repositorio.

## Procedencia

Los enunciados se encuentran en
[`rpmaya/webII_public`](https://github.com/rpmaya/webII_public).
