# Web II — Soluciones

Soluciones organizadas con la misma estructura que el repositorio de
enunciados de la asignatura.

## Estructura

- `ejercicios/T1` a `ejercicios/T10`: ejercicios independientes por tema.
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

## Procedencia

Los enunciados se encuentran en
[`rpmaya/webII_public`](https://github.com/rpmaya/webII_public).

