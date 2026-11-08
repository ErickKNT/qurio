# Declaración de Intención: Qurio MVP

**Fecha:** 2026-11-07  
**Estado:** Confirmado  
**Metodología:** interview-me  

---

## 1. Declaración de Intención

* **Outcome:** Construir el MVP de **Qurio**, una plataforma web interactiva de aprendizaje de SQL con rutas formativas gamificadas, playground analítico y evaluación semántica automática de consultas sobre un entorno PostgreSQL real.
* **User:** Personas autodidactas en la web pública (estudiantes, analistas de datos y desarrolladores junior) que buscan aprender y dominar SQL practicando con escenarios empresariales reales sin fricciones innecesarias.
* **Why now:** Se cuenta con la propuesta de producto inicial (`SQL_Academy_Propuesta_Arquitectura_MVP.md`) y los mockups interactivos completos (*Terminal Glow Minimal* en Tailwind CSS dentro de `docs/stitch_qurio_interactive_sql_platform`); es el momento de asentar el PRD y el SAD para comenzar la implementación técnica con bases sólidas.
* **Success:** Un usuario registrado abre un ejercicio, escribe su consulta en Monaco Editor, la ejecuta contra un contenedor PostgreSQL aislado en Docker con timeout estricto (`statement_timeout = 2s`), recibe validación semántica instantánea y ve su XP y progreso persistidos en Supabase.
* **Constraint:** Arquitectura híbrida pragmática: **Supabase** asume Auth, perfiles y catálogo/progreso de la aplicación; un contenedor **Docker** aislado gestiona el PostgreSQL de práctica y el backend FastAPI actúa como orquestador y evaluador seguro.
* **Out of scope:** Laboratorios efímeros de DDL con terminales SSH dedicadas (se posponen para una fase posterior), pasarelas de pago/suscripciones, aplicación móvil nativa, soporte para motores distintos a PostgreSQL y modo multijugador o colaborativo en tiempo real.
