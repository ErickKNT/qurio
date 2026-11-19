# Declaración de Intención: Ruta 4 — Ingeniería y Manipulación de Datos (DML & DDL)

**Fecha:** 2026-11-18  
**Estado:** Confirmado  
**Metodología:** `interview-me` → `spec-driven-development`  

---

## 1. Declaración de Intención (`Statement of Intent`)

* **Outcome:** Implementar la **Ruta 4 ("Ingeniería y Manipulación de Datos: DML & DDL")** con **4 módulos (Módulos 13 a 16)** y **16 retos (`sort_order` 61..76)**, permitiendo a los usuarios ejecutar sentencias `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` y `CREATE/DROP INDEX` con dificultad progresiva (`Intermedio` en Módulos 13–15 y `Avanzado` en Módulo 16), integrada con guías teóricas interactivas, autocompletado en Monaco Editor y constancia verificable PDF/QR.
* **User:** Estudiantes, analistas y desarrolladores en Qurio que, tras dominar consultas analíticas de lectura (Rutas 1–3), necesitan aprender a insertar, actualizar, eliminar datos, diseñar esquemas con restricciones de integridad y crear índices de optimización en PostgreSQL 16.
* **Why now:** Hasta hoy Qurio evalúa únicamente consultas de lectura (`SELECT` / DQL). Agregar operaciones de manipulación (DML) y definición (DDL) completa el dominio integral de SQL para perfiles Backend, Full-Stack y Data Engineering sin sacrificar el aislamiento del sandbox.
* **Success:** El alumno escribe una única sentencia DML/DDL por reto (tanto al pulsar **"Probar Consulta"** como **"Enviar Solución"**), el backend la ejecuta en una transacción efímera aislada sobre tablas clonadas en el esquema temporal de la sesión (`pg_temp`) con secuencias deterministas, corre automáticamente una `verification_query` interna para proyectar la tabla o catálogo resultante en `DataGridResults` (entre 1 y 20 filas), evalúa equivalencia semántica + AST y ejecuta `ROLLBACK`, garantizando **0 contaminación de `public.*`** y **0 fallos** en `pytest` y `Vitest`.
* **Constraint:** Seguridad estricta en el sandbox Docker (`512MB RAM`): prohibición absoluta de múltiples sentencias encadenadas (`;`), validación AST contextual por modo de ejecución (`READ_ONLY`, `DML_SAFE`, `DDL_SAFE`), bloqueo de comandos y funciones de sistema peligrosas (`COPY`, `GRANT`, `REVOKE`, `CREATE FUNCTION`, `CREATE EXTENSION`, `pg_sleep`, `dblink`, `pg_read_file`), `statement_timeout = 2000ms`, `lock_timeout = 500ms`, `temp_file_limit = 16MB`, y sincronía triple (`seed_data.py`, `fallbackCurriculum.ts` sin `solution_query` ni `verification_query`, y `02_seed_curriculum.sql`).
* **Out of scope:** Permitir mutaciones persistentes entre peticiones HTTP en el SQL Playground libre (`/playground` permanece `READ_ONLY`) o levantar contenedores Docker efímeros separados por cada usuario.
