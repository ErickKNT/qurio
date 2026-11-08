# Lista de Tareas Activas (Todo)

## Fase 1: Cimientos de Datos & Docker (`feat/database-and-docker-infra`)

- [x] **T1.1:** Crear script de seguridad del sandbox `database/sandbox/init.sql` (creación de rol `readonly_student`, `statement_timeout = 2000`, permisos `SELECT`).
- [x] **T1.2:** Crear dataset relacional `Ecommerce_Production_DB` en `database/sandbox/ecommerce_seed.sql` (10 tablas con datos semilla de negocio realistas).
- [x] **T1.3:** Crear esquema de aplicación para Supabase en `database/supabase/01_schema.sql` (tablas de perfiles, rutas, módulos, ejercicios, intentos y logros).
- [x] **T1.4:** Crear catálogo inicial de las 3 rutas y ejercicios en `database/supabase/02_seed_curriculum.sql`.
- [x] **T1.5:** Configurar `docker-compose.yml` para levantar el contenedor PostgreSQL Sandbox en el puerto local 5433 con límites de recursos.
- [x] **T1.6:** Probar y verificar la inicialización del contenedor Docker y la conectividad con el usuario de solo lectura.
- [x] **T1.7:** Commit de la rama `feat/database-and-docker-infra` y sincronización con GitHub (`git push`).
