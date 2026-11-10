# Graph Report - Qurio  (2026-11-10)

## Corpus Check
- 151 files · ~279,100 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .example 2, .ini 1)

## Summary
- 1904 nodes · 3002 edges · 116 communities (102 shown, 14 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 372 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f2abc4b7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- App.tsx
- Docker Sandbox Infrastructure
- package.json
- Supabase Cloud Authentication Context
- test_integration.py
- TypeScript Web Compilation Configuration
- ExercisePublicDTO
- test_security.py
- router.py
- 3. Registro Cronológico de Entradas
- AuthenticatedUser
- evaluate_solution
- FastAPI Application Lifespan
- TypeScript Node Configuration
- Exercise Catalog Query Routes
- test_supabase_migration.py
- Automated Quality Gate Scripts
- Design System and Architecture Concepts
- Agent Workflow Automation Shell
- PostgreSQL Docker Sandbox
- Hardening Controls
- computeOfficialTracksProgress
- Qurio — Plataforma Interactiva de Aprendizaje SQL & Analítica Relacional
- Qurio — Product Requirements Document (PRD)
- Qurio — Software Architecture Document (SAD)
- Code Review and Quality
- Test-Driven Development
- Context Engineering
- test_auth.py
- router.py
- Git Workflow and Versioning
- Optimization Patterns
- Shipping and Launch
- API and Interface Design
- Browser Testing with DevTools
- Frontend UI Engineering
- Especificación Curricular y Marco Pedagógico — Qurio (50 Retos)
- CI/CD and Automation
- Constraint-Driven Development
- Deprecation and Migration
- Documentation and ADRs
- Incremental Implementation
- Auditoría Técnica de Seguridad, Arquitectura y Plan de Remediación — Qurio
- Code Simplification
- Debugging and Error Recovery
- Interview Me
- Planning and Task Breakdown
- ReOrder: Keep Your Regulars Ordering Direct
- Idea Refine
- Doubt-Driven Development
- Process
- Using Agent Skills
- Find Skills
- Spec-Driven Development
- BITACORA.md
- Source-Driven Development
- Refinement & Evaluation Criteria
- TrackCard
- SQL Academy --- Propuesta de producto y arquitectura del MVP
- QURIO — Plan de Ingeniería de Fase 10: Estabilización Técnica y Preparación Comercial
- useTheme.tsx
- Ideation Frameworks Reference
- Ponytail Help
- InMemoryRateLimiter
- 6.5 Arquitectura de la Experiencia de Invitados (Decisión Aprobada `D-05`)
- Modalidades de aprendizaje
- 4. Arquitectura técnica
- 1. Fases del Proyecto
- ponytail-audit/SKILL.md
- Ponytail Gain
- ponytail-review/SKILL.md
- Ponytail
- Qurio — Informe Final de Certificación Técnica y Cierre de Fase 10
- sandbox_db
- ponytail-debt/SKILL.md
- 4. Modelo de Negocio y Estrategia de Monetización
- AchievementsView.tsx
- 7. Especificación Técnica de `C-05` (`PR-10.4`): Arquitectura de Navegación Web, Routing y Deep Linking
- 15. Documentación técnica que debe elaborarse
- 6. Motor de evaluación SQL
- 6. Especificación Técnica de `C-04` (`PR-10.3b`): Consistencia del Esquema de Datos (`pagos` vs `metodos_pago`)
- 12. Diseño visual e identidad
- 14. Criterios de calidad
- 1. Visión del producto
- 5. Diseño de la base de datos principal
- 8. Gamificación y experiencia profesional
- 9. Alcance del MVP
- Qurio — Reporte de Revisión Final de Consistencia Técnica Documental v1.2
- QURIO — Product & Business Blueprint
- 4. Especificación Técnica de `C-02` (`PR-10.2`): Fuente Única de Persistencia y Contrato Autoritativo
- Qurio — Nueva Línea Base Operativa de Desarrollo
- Badge
- Reporte de Actualización Documental — Qurio Blueprint v1.1 y Phase 10 Stabilization Plan v1.1
- 9. Arquitectura Técnica Actual y Evolución SaaS
- 5.4 Desglose Curricular Detallado por Ruta
- Button
- 3.3 Desarrollo Detallado por Segmento
- 7.1 Estrategia Go-To-Market (GTM): Foco Inicial México $\to$ Expansión LATAM
- 6. Diagnóstico Forense de las Cinco Brechas de Fase 10
- 3. Especificación Técnica de `C-01` (`PR-10.1`): Protección Estricta de `solution_query`
- 5. Especificación Técnica de `C-03` (`PR-10.3a`): Cálculo Determinista de Progreso por Ruta de Aprendizaje
- 4. Auditoría Funcional del Núcleo de Aprendizaje
- 11.2 Clasificación de Gobernanza: Decisiones Establecidas, Recomendaciones, Hipótesis y Aprobaciones Pendientes
- 4.6 Evaluación Técnica y Operativa del Proveedor de Pagos: Stripe México y Alternativas (Decisión Aprobada `D-03`)
- 8. Roadmap de Producto de 12 Meses
- row_to_comparable_tuple
- 2.2 Contradicciones y Brechas entre la Visión Comercial y el Estado Actual del Código

## God Nodes (most connected - your core abstractions)
1. `cn()` - 48 edges
2. `react` - 36 edges
3. `Badge()` - 36 edges
4. `Button` - 34 edges
5. `3. Registro Cronológico de Entradas` - 33 edges
6. `App()` - 30 edges
7. `validate_sql_security()` - 28 edges
8. `3.1 Monorepo y Componentes` - 28 edges
9. `evaluate_solution()` - 27 edges
10. `ExerciseSpecPanel()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `1.1 Protección de soluciones de ejercicios (`C-01` — Secciones 2.2, 2.3, 8, 9.5 y 11.2)` --references--> `ExercisePublicDTO`  [INFERRED]
  docs/ACTUALIZACION_DOCUMENTAL_V1_1.md → apps/api/app/modules/curriculum/seed_data.py
- `PR-10.1 — `C-01`: Protección de `solution_query` (Sección 3)` --references--> `ExercisePublicDTO`  [INFERRED]
  docs/ACTUALIZACION_DOCUMENTAL_V1_1.md → apps/api/app/modules/curriculum/seed_data.py
- `2.3 Especificación de Seguridad para la Protección de Soluciones (`C-01`)` --references--> `ExercisePublicDTO`  [INFERRED]
  docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md → apps/api/app/modules/curriculum/seed_data.py
- `Fase 10 (Pre-Requisito Inmediato): Estabilización Técnica y Preparación Comercial (`C-01` a `C-05`)` --references--> `ExercisePublicDTO`  [INFERRED]
  docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md → apps/api/app/modules/curriculum/seed_data.py
- `6.1 Brecha C-01: Protección de `solution_query`` --references--> `ExerciseDetail`  [INFERRED]
  docs/audits/QURIO_OPERATIONAL_AUDIT.md → apps/api/app/modules/curriculum/seed_data.py

## Import Cycles
- None detected.

## Communities (116 total, 14 thin omitted)

### Community 0 - "cn"
Cohesion: 0.12
Nodes (36): KbdShortcut(), KbdShortcutProps, RadioTab(), RadioTabProps, TextInput, TextInputProps, AuthModalProps, AuthMode (+28 more)

### Community 1 - "App.tsx"
Cohesion: 0.07
Nodes (42): SqlPlaygroundView, UserProfileView, SchemaTableItemProps, DataGridResultsProps, SqlPlaygroundViewProps, STARTER_QUERIES, UserProfileViewProps, AuthContext (+34 more)

### Community 2 - "Docker Sandbox Infrastructure"
Cohesion: 0.05
Nodes (42): build, container_name, depends_on, environment, networks, ports, restart, context (+34 more)

### Community 3 - "package.json"
Cohesion: 0.06
Nodes (42): dependencies, clsx@^2.1.1, lucide-react@^1.16.0, @monaco-editor/react@^4.7.0, react@^18.3.1, react-dom@^18.3.1, @supabase/supabase-js@^2.49.1, tailwind-merge@^2.6.0 (+34 more)

### Community 4 - "Supabase Cloud Authentication Context"
Cohesion: 0.13
Nodes (14): ATTEMPTS_STORAGE_KEY, DRAFT_SQL_PREFIX, ExerciseAttemptData, GUEST_PROGRESS_STORAGE_KEY, GuestProgressItem, LOCAL_PROFILE_STORAGE_KEY, persistence, isSupabaseConfigured (+6 more)

### Community 5 - "test_integration.py"
Cohesion: 0.07
Nodes (43): test_guest_trial_limit_enforced(), test_health_endpoint(), test_list_and_get_exercises(), test_playground_blocked_cte_delete(), test_playground_execute_security_block(), test_playground_execute_syntax_error(), test_playground_execute_valid_query(), test_playground_recursive_cte_timeout() (+35 more)

### Community 6 - "TypeScript Web Compilation Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+11 more)

### Community 7 - "ExercisePublicDTO"
Cohesion: 0.20
Nodes (9): ExerciseRepository, ExercisePublicDTO, 3.6 Especificación Verificable de Pruebas para `PR-10.1` (`C-01`), 5.2 Diff Completo de `PHASE_10_STABILIZATION_PLAN.md` (v1.2 vs. v1.1), 3.1 Bloque A — Certificación de Seguridad Curricular (`C-01`), [2026-11-10] — Entrada 24: Cierre de Auditoría Operativa, Validación Ejecutable y Consolidación de la Línea Base (`QURIO-OPERATIONAL-BASELINE-02`), 3.6 Especificación Verificable de Pruebas para `PR-10.1` (`C-01`), 3. Fuente Maestra Única vs. Representaciones Derivadas y Mecanismo de Sincronización (+1 more)

### Community 8 - "test_security.py"
Cohesion: 0.08
Nodes (27): enforce_row_limit(), strip_sql_comments(), validate_sql_security(), test_all_curriculum_queries_pass_security(), test_allow_parenthesized_subqueries(), test_allow_recursive_cte(), test_allow_set_operations_union_intersect_except(), test_block_alter_table() (+19 more)

### Community 9 - "router.py"
Cohesion: 0.10
Nodes (7): Settings, record_verified_progress(), ExerciseConcept, ExerciseDetail, SampleTableData, test_guest_rate_limit(), 2.1.2 Solución Arquitectónica en Backend (`apps/api/`)

### Community 10 - "3. Registro Cronológico de Entradas"
Cohesion: 0.07
Nodes (50): App(), ViewLoadingFallback(), AuthModal(), SuccessModal(), DataGridResults(), ExerciseSpecPanel(), MonacoEditorPanel(), MonacoEditorPanelProps (+42 more)

### Community 11 - "AuthenticatedUser"
Cohesion: 0.19
Nodes (4): check_rate_limit(), get_client_ip(), execute_playground_query(), submit_exercise_solution()

### Community 12 - "evaluate_solution"
Cohesion: 0.20
Nodes (17): evaluate_solution(), EvaluationStatus, make_result(), test_evaluator_column_count_mismatch(), test_evaluator_column_name_mismatch(), test_evaluator_database_error(), test_evaluator_decimal_exact_precision(), test_evaluator_decimal_scale_numerical_equivalence() (+9 more)

### Community 13 - "FastAPI Application Lifespan"
Cohesion: 0.18
Nodes (4): add_security_headers(), lifespan(), root(), [2026-11-07] — Entrada 08: Fase 2 — Motor de Ejecución y Evaluación en FastAPI

### Community 14 - "TypeScript Node Configuration"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 15 - "Exercise Catalog Query Routes"
Cohesion: 0.29
Nodes (4): get_exercise(), health_check(), list_exercises(), 3.1 Diagnóstico Forense

### Community 16 - "test_supabase_migration.py"
Cohesion: 0.08
Nodes (15): test_ecommerce_seed_canonical_tables_and_row_counts(), test_no_obsolete_metodos_pago_in_docs_and_specs(), test_spec_panel_exposes_all_10_tables(), create_test_user(), db_conn(), setup_mock_supabase_environment(), test_authoritative_xp_calculation_across_rewards_and_hints(), test_concurrent_different_exercises_no_lost_updates() (+7 more)

### Community 29 - "Hardening Controls"
Cohesion: 0.05
Nodes (42): Broken Access Control, Broken Authentication, Cross-Site Scripting (XSS), Data Classification, Dependency Audit Triage, Destructive Operations on Derived Paths, File Upload Safety, Hardening Patterns (+34 more)

### Community 30 - "computeOfficialTracksProgress"
Cohesion: 0.12
Nodes (19): computeOfficialTracksProgress(), 10.1 Limitaciones Metodológicas, 10.2 Conclusión Técnica y Estado de Cierre, 10. Riesgos Técnicos y Limitaciones de la Auditoría, 11. Certificación de Cierre de Brechas (`QURIO-OPERATIONAL-BASELINE-02`), 1.1 Contexto de la Auditoría, 1.2 Hallazgos Más Relevantes a Nivel Directivo, 1. Resumen Ejecutivo (+11 more)

### Community 31 - "Qurio — Plataforma Interactiva de Aprendizaje SQL & Analítica Relacional"
Cohesion: 0.06
Nodes (32): 1. Aislamiento del Sandbox de Ejecución (PostgreSQL en Docker), 1. Clonar el Repositorio, 2. Blindaje de Backend y Supabase Cloud (Hardening v5.0), 2. Estética *Terminal Glow Minimal*, 2. Iniciar el Sandbox PostgreSQL (Docker), 3. Configurar y Ejecutar la API (FastAPI), 4. Configurar y Ejecutar el Frontend (React + Vite), 5. Ejecutar la Suite de Pruebas Automatizadas (+24 more)

### Community 32 - "Qurio — Product Requirements Document (PRD)"
Cohesion: 0.07
Nodes (30): 1.1 Declaración de Visión, 1.2 Objetivos del MVP, 1. Visión y Objetivos del Producto, 2. Mapa de Capacidades del MVP (Capability Map), 3.1 Perfil Principal: El Autodidacta Pragmático (Junior Dev / Analista de Datos), 3. Personas y Usuarios Objetivo, 4. Historias de Usuario y Criterios de Aceptación (Gherkin), 5.1 Módulo 1: Autenticación y Usuarios (`auth-profile`) (+22 more)

### Community 33 - "Qurio — Software Architecture Document (SAD)"
Cohesion: 0.07
Nodes (30): 1.1 Declaración de Arquitectura, 1.2 Principios de Diseño, 1. Visión y Principios Arquitectónicos, 2. Stack Tecnológico, 3.1 Directrices de Atomic Design Pragmático, 3. Estructura del Repositorio (Monorepo), 4.1 Flujo de Ejecución y Validación, 4.2 Medidas de Seguridad del Sandbox (+22 more)

### Community 34 - "Code Review and Quality"
Cohesion: 0.07
Nodes (29): 1. Correctness, 2. Readability & Simplicity, 3. Architecture, 4. Security, 5. Performance, Change Descriptions, Change Sizing, Code Review and Quality (+21 more)

### Community 35 - "Test-Driven Development"
Cohesion: 0.07
Nodes (29): Browser Testing with DevTools, Common Rationalizations, DAMP Over DRY in Tests, Decision Guide, Discover the Stack First, Name Tests Descriptively, One Assertion Per Concept, Overview (+21 more)

### Community 36 - "Context Engineering"
Cohesion: 0.07
Nodes (28): Anti-Patterns, Common Rationalizations, Compress before dropping, Confusion Management, Context Budget Management, Context Engineering, Context Packing Strategies, Level 1: Rules Files (+20 more)

### Community 37 - "test_auth.py"
Cohesion: 0.11
Nodes (13): AuthenticatedUser, decode_jwt_token(), get_jwk_client(), get_optional_current_user(), get_required_current_user(), ec_key_pair(), make_valid_token(), test_expired_token_raises_401() (+5 more)

### Community 38 - "router.py"
Cohesion: 0.12
Nodes (9): inspect_pedagogical_requirements(), ColumnInfo, DiffResult, EvaluationResponse, ExecutionResult, ExerciseSubmitRequest, QueryExecuteRequest, SandboxRunner (+1 more)

### Community 39 - "Git Workflow and Versioning"
Cohesion: 0.07
Nodes (26): 1. Commit Early, Commit Often, 2. Atomic Commits, 3. Descriptive Messages, 4. Keep Concerns Separate, 5. Size Your Changes, Branch Naming, Branching Strategy, Change Summaries (+18 more)

### Community 40 - "Optimization Patterns"
Cohesion: 0.07
Nodes (25): Connection Pool Exhaustion, Large Bundle Size, Missing Caching (Backend), Missing Image Optimization (Frontend), N+1 Queries (Backend), Optimization Patterns, Queries That Ignore Their Index, Unbounded Data Fetching (+17 more)

### Community 41 - "Shipping and Launch"
Cohesion: 0.08
Nodes (25): Accessibility, Code Quality, Common Rationalizations, Documentation, Error Budget Release Gate, Error Reporting, Feature Flag Strategy, Infrastructure (+17 more)

### Community 42 - "API and Interface Design"
Cohesion: 0.08
Nodes (24): 1. Contract First, 2. Consistent Error Semantics, 3. Validate at Boundaries, 4. Prefer Addition Over Modification, 5. Predictable Naming, 6. Honouring an Idempotency Key, API and Interface Design, Common Rationalizations (+16 more)

### Community 43 - "Browser Testing with DevTools"
Cohesion: 0.08
Nodes (24): Accessibility Verification with DevTools, Available Tools, Browser Testing with DevTools, Clean Console Standard, Common Rationalizations, Console Analysis Patterns, Content Boundary Markers, For Network Issues (+16 more)

### Community 44 - "Frontend UI Engineering"
Cohesion: 0.08
Nodes (24): Accessibility (WCAG 2.1 AA), ARIA Labels, Avoid the AI Aesthetic, Color, Common Rationalizations, Component Architecture, Component Patterns, Design System Adherence (+16 more)

### Community 45 - "Especificación Curricular y Marco Pedagógico — Qurio (50 Retos)"
Cohesion: 0.09
Nodes (23): 1. Declaración de Rigor Pedagógico (Anti-AI Slop Educativo), 2.1 El Orden Lógico de Procesamiento de Consultas, 2.2 Fuentes Documentales de Referencia, 2. Marco Teórico y Fuentes Oficiales, 3. Matriz Curricular: Distribución Piramidal de los 50 Retos, 4. Catálogo Detallado de Retos: Objetivos, Fuentes y Consignas, 5. Garantía de Calidad y Verificación Técnica, Especificación Curricular y Marco Pedagógico — Qurio (50 Retos) (+15 more)

### Community 46 - "CI/CD and Automation"
Cohesion: 0.08
Nodes (23): Automation Beyond CI, Basic CI Pipeline, Build Cop Role, CI/CD and Automation, CI Optimization, Common Rationalizations, Dependabot / Renovate, Deployment Strategies (+15 more)

### Community 47 - "Constraint-Driven Development"
Cohesion: 0.08
Nodes (22): Adapting it, Contract, Floor guard: reference implementation, Reference (Node, ~stack-agnostic patterns), Common Rationalizations, Constraint-Driven Development, Escalation Path, Loading Constraints (+14 more)

### Community 48 - "Deprecation and Migration"
Cohesion: 0.08
Nodes (23): Adapter Pattern, Code Is a Liability, Common Rationalizations, Compulsory vs Advisory Deprecation, Core Principles, Database Schema Migrations (Expand/Contract), Deprecation and Migration, Deprecation Planning Starts at Design Time (+15 more)

### Community 49 - "Documentation and ADRs"
Cohesion: 0.09
Nodes (22): ADR Lifecycle, ADR Template, API Documentation, Architecture Decision Records (ADRs), Changelog Maintenance, Common Rationalizations, Document Known Gotchas, Documentation and ADRs (+14 more)

### Community 50 - "Incremental Implementation"
Cohesion: 0.09
Nodes (22): Common Rationalizations, Contract-First Slicing, Implementation Rules, Increment Checklist, Incremental Implementation, Overview, Red Flags, Risk-First Slicing (+14 more)

### Community 51 - "Auditoría Técnica de Seguridad, Arquitectura y Plan de Remediación — Qurio"
Cohesion: 0.09
Nodes (22): 10. Orden Exacto de Implementación Propuesto, 11. Operaciones que Requieren tu Autorización Explícita, 12. Riesgo Residual Aceptado, 1. Resumen Ejecutivo y Diagnóstico Global, 2. Mapa Arquitectónico y Fronteras de Confianza Propuestas, 3. Inventario y Estado Inicial de Pruebas, 4. Verificación y Reclasificación Rigurosa de Hallazgos, 5.1 SQL Runner y SQLGlot (Defensa en Profundidad sin Bloqueo Indiscriminado) (+14 more)

### Community 52 - "Code Simplification"
Cohesion: 0.09
Nodes (21): 1. Preserve Behavior Exactly, 2. Follow Project Conventions, 3. Prefer Clarity Over Cleverness, 4. Maintain Balance, 5. Scope to What Changed, Code Simplification, Common Rationalizations, Language-Specific Guidance (+13 more)

### Community 53 - "Debugging and Error Recovery"
Cohesion: 0.09
Nodes (21): Build Failure Triage, Common Rationalizations, Debugging and Error Recovery, Error-Specific Patterns, Instrumentation Guidelines, Overview, Red Flags, Runtime Error Triage (+13 more)

### Community 54 - "Interview Me"
Cohesion: 0.11
Nodes (18): Common Rationalizations, Example, Interaction with Other Skills, Interview Me, Loading Constraints, Output, Overview, Red Flags (+10 more)

### Community 55 - "Planning and Task Breakdown"
Cohesion: 0.11
Nodes (18): Common Rationalizations, Output Files, Overview, Parallelization Opportunities, Plan Document Template, Planning and Task Breakdown, Red Flags, See Also (+10 more)

### Community 56 - "ReOrder: Keep Your Regulars Ordering Direct"
Cohesion: 0.11
Nodes (17): Example 1: Vague Early-Stage Concept (Full 3-Phase Session), Example 2: Feature Idea Within an Existing Product (Codebase-Aware), Example 3: Process/Workflow Idea (Non-Product), Ideation Session Examples, Key Assumptions to Validate, MVP Scope, Not Doing (and Why), Open Questions (+9 more)

### Community 57 - "Idea Refine"
Cohesion: 0.11
Nodes (17): Anti-patterns to Avoid, Common Rationalizations, Detailed Instructions, How It Works, Idea Refine, Output, Overview, Phase 1: Understand & Expand (Divergent) (+9 more)

### Community 58 - "Doubt-Driven Development"
Cohesion: 0.12
Nodes (15): Common Rationalizations, Cross-model escalation, Doubt-Driven Development, Interaction with Other Skills, Loading Constraints, Overview, Red Flags, Step 1: CLAIM — Surface what stands (+7 more)

### Community 59 - "Process"
Cohesion: 0.12
Nodes (15): 1. Define "working" before instrumenting, 2. Pick the right signal for each question, 3. Structured logging, 4. Metrics, 5. Distributed tracing, 6. Alerting, 7. Verify the telemetry itself, Common Rationalizations (+7 more)

### Community 60 - "Using Agent Skills"
Cohesion: 0.13
Nodes (14): 1. Surface Assumptions, 2. Manage Confusion Actively, 3. Push Back When Warranted, 4. Enforce Simplicity, 5. Maintain Scope Discipline, 6. Verify, Don't Assume, Core Operating Behaviors, Failure Modes to Avoid (+6 more)

### Community 61 - "Find Skills"
Cohesion: 0.14
Nodes (13): Common Skill Categories, Find Skills, How to Help Users Find Skills, Step 1: Understand What They Need, Step 2: Check the Leaderboard First, Step 3: Search for Skills, Step 4: Verify Quality Before Recommending, Step 5: Present Options to the User (+5 more)

### Community 62 - "Spec-Driven Development"
Cohesion: 0.14
Nodes (13): Common Rationalizations, Keeping the Spec Alive, Overview, Phase 0: Scope Check, Phase 1: Specify, Phase 2: Plan, Phase 3: Tasks, Phase 4: Implement (+5 more)

### Community 63 - "BITACORA.md"
Cohesion: 0.07
Nodes (31): 1. Estado Actual del Proyecto, 2. Tablero de Control de Fases, 4. Estado de la Integración con Supabase Cloud, Bitácora de Desarrollo — Qurio, 1. Declaración de Intención, Declaración de Intención: Qurio MVP, 1. Resumen Ejecutivo, 2.1 Revocación Explícita de `SELECT` por Columna en `exercise_attempts` (+23 more)

### Community 64 - "Source-Driven Development"
Cohesion: 0.15
Nodes (12): Common Rationalizations, Overview, Red Flags, Retrieval Safety: Treat Fetched Content as Data, Source-Driven Development, Step 1: Detect Stack and Versions, Step 2: Fetch Official Documentation, Step 3: Implement Following Documented Patterns (+4 more)

### Community 65 - "Refinement & Evaluation Criteria"
Cohesion: 0.17
Nodes (11): 1. User Value, 2. Feasibility, 3. Differentiation, Assumption Audit, Core Evaluation Dimensions, Decision Framework, Might Be True (Nice to Have), Must Be True (Dealbreakers) (+3 more)

### Community 66 - "TrackCard"
Cohesion: 0.28
Nodes (15): ModuleAccordion(), TrackCard(), TracksView(), computeGuestTrialTracksProgress(), 2.1 Corrección C-03: Fuente Autoritativa del Progreso y Estados de Carga, 4.8 Estimación de Complejidad y Orden Recomendado, 5.1 Diff Completo de `QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` (v1.2 vs. v1.1), 5.4 Solución Propuesta (+7 more)

### Community 67 - "SQL Academy --- Propuesta de producto y arquitectura del MVP"
Cohesion: 0.17
Nodes (11): 10. Estructura del repositorio, 11. API inicial, 13. Plan de desarrollo, 16. Decisiones pendientes, 17. Principios del proyecto, 18. Próximo paso recomendado, 3. Rutas de aprendizaje, 7. Seguridad del motor de ejecución (+3 more)

### Community 68 - "QURIO — Plan de Ingeniería de Fase 10: Estabilización Técnica y Preparación Comercial"
Cohesion: 0.20
Nodes (10): 1. Propósito, Alcance y Estado Normativo de la Fase 10, 2. Invariantes de Seguridad de Fase 9 y Alineación Estratégica (`D-01` a `D-07`), 8.1 Diagrama de Secuencia de Ejecución de la Fase 10, 8.2 Tabla de los Cuatro Entregables y Secuencia de Trabajo Propuesta, 8.4 ¿Qué Debe Completarse Obligatoriamente Antes de Introducir Pagos o Entitlements?, 8. Secuencia Recomendada de Implementación, Entregables Atómicos y Matriz Maestra de Pruebas, Historial de Cambios, Matriz Resumen de las 5 Prioridades Técnicas de Fase 10 (`D-07`) (+2 more)

### Community 69 - "useTheme.tsx"
Cohesion: 0.15
Nodes (13): AuthProvider(), getInitialTheme(), syncDOMWithTheme(), Theme, ThemeContext, ThemeContextType, ThemeProvider(), 5.1 Estado de la Autenticación (+5 more)

### Community 70 - "Ideation Frameworks Reference"
Cohesion: 0.22
Nodes (8): Analogous Inspiration, Constraint-Based Ideation, First Principles Thinking, How Might We (HMW), Ideation Frameworks Reference, Jobs to Be Done (JTBD), Pre-mortem, SCAMPER

### Community 71 - "Ponytail Help"
Cohesion: 0.22
Nodes (8): Band (Claude Code), Configure Default Mode, Deactivate, Levels, More, Ponytail Help, Skills, Update

### Community 73 - "6.5 Arquitectura de la Experiencia de Invitados (Decisión Aprobada `D-05`)"
Cohesion: 0.15
Nodes (13): 1. Alcance del Acceso de Invitado (3 Ejercicios de Prueba), 2. Persistencia del Estado de Invitado (100% Efímera en Cliente, Sin XP Oficial), 3. Mecanismo de Migración Seguro, Resiliente e Idempotente al Registrarse, 4. Especificación de Pruebas Unitarias y de Integración para `D-05`, 4. Límites de Ejecución y Prevención de Abuso para Invitados, 5. Matriz de Diferencias: Invitado vs. Usuario Registrado (`Qurio Free`) vs. `Qurio Plus`, 6.1 El Ciclo de Aprendizaje Activo en Qurio, 6.2 Regla de Oro de la Gamificación: Subordinación al Dominio Real (+5 more)

### Community 74 - "Modalidades de aprendizaje"
Cohesion: 0.29
Nodes (7): 2. Arquitectura funcional, A. Editor SQL interactivo, B. Retos de resolución de problemas, C. Laboratorio de bases de datos, D. Desafíos de optimización, E. Proyectos prácticos, Modalidades de aprendizaje

### Community 75 - "4. Arquitectura técnica"
Cohesion: 0.29
Nodes (7): 4. Arquitectura técnica, A. Application Database, Arquitectura lógica, B. SQL Execution Engine, Enfoque arquitectónico, Separación de bases de datos, Stack tecnológico

### Community 76 - "1. Fases del Proyecto"
Cohesion: 0.25
Nodes (7): 1. Fases del Proyecto, Fase 1: Cimientos de Datos & Docker (`feat/database-and-docker-infra`), Fase 2: Motor de Ejecución y Evaluación (`feat/fastapi-runner-evaluator`), Fase 4: Flujo End-to-End del Ejercicio (`feat/exercise-ide-flow`), Fase 5: Rutas, Playground y Gamificación (`feat/curriculum-and-gamification`), Fase 6: Autenticidad, Pulido y Despliegue (`feat/authenticity-and-polish`), Plan de Implementación General — Qurio MVP

### Community 77 - "ponytail-audit/SKILL.md"
Cohesion: 0.40
Nodes (4): 1. Map first, 2. Look for, 3. Check before you report, 4. Output

### Community 78 - "Ponytail Gain"
Cohesion: 0.40
Nodes (4): Boundaries, Honesty boundary, Ponytail Gain, Scoreboard

### Community 79 - "ponytail-review/SKILL.md"
Cohesion: 0.40
Nodes (4): 1. Understand first, 2. Look for, 3. Check before you report, 4. Output

### Community 80 - "Ponytail"
Cohesion: 0.40
Nodes (4): Before you write, Levels, Ponytail, The smallest complete change

### Community 81 - "Qurio — Informe Final de Certificación Técnica y Cierre de Fase 10"
Cohesion: 0.15
Nodes (13): 10. Conclusión y Recomendación Operativa, 1. Declaración del Equipo Multidisciplinario Senior, 2. Inspección y Trazabilidad Git (Actividad 1), 3.2 Bloque B — Persistencia, Límite de Invitados y Migración Resiliente (`C-02` + `D-05`), 3.3 Bloque C — Integridad del Avance y Esquema Canónico (`C-03` + `C-04`), 3. Revisión Correctiva por Bloques Funcionales, 4.2 Comparativa de Rendimiento Antes vs. Después, 4. Rendimiento y Code Splitting (Bloque 10) (+5 more)

### Community 82 - "sandbox_db"
Cohesion: 0.25
Nodes (6): client(), sandbox_db(), 5.1 Desacoplamiento en Backend (`apps/api/tests/conftest.py`), 5.3 Resultados de la Suite Automatizada del Frontend (Vitest), 5. Calidad de Pruebas y Desacoplamiento Arquitectónico (Bloque E), 8. Matriz de Hallazgos y Remediaciones

### Community 83 - "ponytail-debt/SKILL.md"
Cohesion: 0.50
Nodes (3): Boundaries, Output, Scan

### Community 84 - "4. Modelo de Negocio y Estrategia de Monetización"
Cohesion: 0.15
Nodes (13): 1. Referencia Inicial de Catálogo Gratuito vs. Premium, 2. Autorización Basada en Identificadores Estables y Verificación Backend, 3. Preservación del Progreso de Usuarios Existentes y Manejo de Modificaciones del Catálogo, 4.1 Arquitectura de Planes (Freemium B2C + Licenciamiento B2B), 4.2 Filosofía del Recorte Freemium: ¿Qué es Gratis y por qué?, 4.3 Estrategia de Conversión, Retención y Prevención de Cancelaciones (*Anti-Churn*), 4.4 Futuro Modelo B2B, Licenciamiento Institucional y Vías de Ingreso Adicionales (`D-06`), 4.5 Reglas de Autorización `Free` vs. `Plus` y Evolución del Catálogo sin Pérdida de Progreso (Decisión Aprobada `D-01`) (+5 more)

### Community 85 - "AchievementsView.tsx"
Cohesion: 0.31
Nodes (7): AchievementsView, AchievementCardProps, ICON_MAP, AchievementsViewProps, CATEGORIES, Achievement, AchievementCategory

### Community 86 - "7. Especificación Técnica de `C-05` (`PR-10.4`): Arquitectura de Navegación Web, Routing y Deep Linking"
Cohesion: 0.25
Nodes (8): 2. Hidratación Segura del Catálogo al Abrir `/exercises/:exerciseId` y `/tracks/:trackId`, 3. Comportamiento según Estado de Sesión (Autenticado vs. No Autenticado), 5. Configuración SPA para el Proveedor de Hosting de Qurio, 7.2 Archivos Afectados, 7.3 Solución Propuesta, 7.5 Criterios de Aceptación de `PR-10.4`, 7.6 Estimación de Complejidad y Orden Recomendado, 7. Especificación Técnica de `C-05` (`PR-10.4`): Arquitectura de Navegación Web, Routing y Deep Linking

### Community 87 - "15. Documentación técnica que debe elaborarse"
Cohesion: 0.50
Nodes (4): 15.1 Product Requirements Document (PRD), 15.2 Software Architecture Document (SAD), 15.3 Database Design Document, 15. Documentación técnica que debe elaborarse

### Community 88 - "6. Motor de evaluación SQL"
Cohesion: 0.50
Nodes (4): 6. Motor de evaluación SQL, Criterios de evaluación, Ejemplo de equivalencia semántica, Flujo de evaluación

### Community 89 - "6. Especificación Técnica de `C-04` (`PR-10.3b`): Consistencia del Esquema de Datos (`pagos` vs `metodos_pago`)"
Cohesion: 0.29
Nodes (7): 6.1 Diagnóstico Forense, 6.2 Archivos Afectados, 6.3 Solución Propuesta y Restricción sobre el Esquema Físico, 6.4 Especificación Verificable de Pruebas para `C-04` (`PR-10.3b`), 6.5 Criterios de Aceptación de `PR-10.3` (`C-03` + `C-04`), 6.6 Estimación de Complejidad y Orden Recomendado, 6. Especificación Técnica de `C-04` (`PR-10.3b`): Consistencia del Esquema de Datos (`pagos` vs `metodos_pago`)

### Community 90 - "12. Diseño visual e identidad"
Cohesion: 0.67
Nodes (3): 12. Diseño visual e identidad, Dirección visual, Pantalla de ejercicio

### Community 91 - "14. Criterios de calidad"
Cohesion: 0.67
Nodes (3): 14. Criterios de calidad, Desarrollo, Operación y seguridad

### Community 92 - "1. Visión del producto"
Cohesion: 0.67
Nodes (3): 1. Visión del producto, Decisiones iniciales, Propuesta de valor

### Community 93 - "5. Diseño de la base de datos principal"
Cohesion: 0.67
Nodes (3): 5. Diseño de la base de datos principal, Entidades principales, Tablas propuestas

### Community 94 - "8. Gamificación y experiencia profesional"
Cohesion: 0.67
Nodes (3): 8. Gamificación y experiencia profesional, Sistema de aprendizaje, Sistema de capacitación

### Community 95 - "9. Alcance del MVP"
Cohesion: 0.67
Nodes (3): 9. Alcance del MVP, Fuera del MVP, Incluido

### Community 96 - "Qurio — Reporte de Revisión Final de Consistencia Técnica Documental v1.2"
Cohesion: 0.18
Nodes (10): 1. Confirmación Explícita de Restricciones y Reglas de Gobernanza, 2.2 Corrección D-05: Recuperación de Migraciones Interrumpidas e Idempotencia, 2.3 Corrección C-01: Fuente Maestra Única del Currículo y Representaciones Derivadas, 2. Resumen de las Cuatro Correcciones Técnicas Incorporadas en v1.2, 3. Matriz de Pruebas Nuevas y Modificadas en la Fase 10 v1.2, 4.1 Estado de Git Antes de Iniciar la Tarea, 4.2 Estado de Git Después de Concluir la Tarea, 4.3 Diferenciación Rigurosa entre Cambios Previos y Cambios de esta Tarea (+2 more)

### Community 97 - "QURIO — Product & Business Blueprint"
Cohesion: 0.17
Nodes (12): 10.1 Diccionario de Métricas Fundamentales (KPIs de Producto y Negocio), 10.2 Análisis de Unit Economics y Margen Bruto por Suscriptor `Qurio Plus`, 10.3 Escenarios Financieros a 12 Meses (Conservador, Intermedio y Ambicioso), 10. Métricas de Negocio, Unit Economics y Escenarios Financieros, 1.1 Propósito y Declaración de Visión, 1.2 Tesis de Mercado: ¿Por qué México y Latinoamérica necesitan a Qurio?, 1.3 Posicionamiento Competitivo, 1. Contexto Estratégico, Visión y Posicionamiento (+4 more)

### Community 98 - "4. Especificación Técnica de `C-02` (`PR-10.2`): Fuente Única de Persistencia y Contrato Autoritativo"
Cohesion: 0.15
Nodes (13): 1. Enriquecimiento de `EvaluationResponse` en FastAPI ([`schemas.py`](../../apps/api/app/modules/runner/schemas.py) y [`router.py`](../../apps/api/app/modules/runner/router.py)), 2. Refactorización de [`apps/web/src/lib/persistence.ts`](../../apps/web/src/lib/persistence.ts), [`useAuth.tsx`](../../apps/web/src/hooks/useAuth.tsx) y [`App.tsx`](../../apps/web/src/App.tsx), 3. Especificación de Migración de Invitados (`D-05`): Recuperación ante Interrupciones, Idempotencia y Cero Falsos Descartes, 4.1 Diagnóstico Forense, 4.2 Archivos Afectados, 4.3 Reglas de Autoridad: Usuarios Autenticados vs. Usuarios Invitados, 4.4 Contrato de `record_verified_attempt` y Alcance de Datos Locales, 4.5 Solución Propuesta (+5 more)

### Community 99 - "Qurio — Nueva Línea Base Operativa de Desarrollo"
Cohesion: 0.17
Nodes (12): 1. Declaración de Intención y Prioridad Estratégica Inmediata, 2.1 Iniciativas EXPLÍCITAMENTE EXCLUIDAS de la Línea Base Inmediata, 2.2 Alcance Inmediato Obligatorio (Fase 10: Brechas `C-01` a `C-05`), 2. Delimitación Estricta del Alcance: Qué SÍ y Qué NO, 3. Estado Actual Verificado vs. Estado Objetivo, 4. Secuencia Operativa de Trabajo (Plan de Estabilización), 5. Criterios de Aceptación Cuantitativos y Cualitativos, 6. Puerta de Entrada al Grupo Piloto (Gate Checklist) (+4 more)

### Community 100 - "Badge"
Cohesion: 0.33
Nodes (18): Badge(), AchievementCard(), SchemaTableItem(), AchievementsView(), AuthConfirmView(), NotFoundView(), ResetPasswordView(), SqlPlaygroundView() (+10 more)

### Community 101 - "Reporte de Actualización Documental — Qurio Blueprint v1.1 y Phase 10 Stabilization Plan v1.1"
Cohesion: 0.09
Nodes (23): 1.1 Protección de soluciones de ejercicios (`C-01` — Secciones 2.2, 2.3, 8, 9.5 y 11.2), 1.2 Arquitectura de ejecución Python (`D-04` — Secciones 9.2, 9.5, 9.6 y 11.2), 1.3 Migración de usuarios invitados (`D-05` — Secciones 6.5 y 11.2), 1.4 Rutas y referencias documentales, 1.5 Estado del documento (Encabezado, Alcance y Sección 11.2), 1. Documentos Actualizados, 2.1 Cambios en `docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md`, 2.2 Cambios en `docs/roadmap/PHASE_10_STABILIZATION_PLAN.md` (Versión `1.1`) (+15 more)

### Community 102 - "9. Arquitectura Técnica Actual y Evolución SaaS"
Cohesion: 0.11
Nodes (19): 1. `plans` (Catálogo Maestro de Planes Comerciales), 1. Separación Estricta de Responsabilidades (Invariante Obligatorio para Cualquier Alternativa), 2. Alternativas Arquitectónicas por Evaluar, 2. `subscriptions` (Ciclo de Vida de Suscripciones B2C y B2B), 3. Matriz Comparativa en las 10 Dimensiones de Ingeniería y Seguridad, 3. `user_entitlements` (Fuente de Verdad Materializada de Permisos Efectivos), 4. `billing_events` (Libro Mayor Inmutable e Idempotencia de Webhooks), 4. Estado de la Decisión y Criterio de Selección Previo a la Implementación (+11 more)

### Community 103 - "5.4 Desglose Curricular Detallado por Ruta"
Cohesion: 0.18
Nodes (11): 5.1 Principios de Diseño Curricular, 5.2 Mapa de Dependencias y Orden de Publicación de Rutas, 5.3 Matriz Maestra de las 5 Rutas Curriculares, 5.4 Desglose Curricular Detallado por Ruta, 5.5 Criterios de Aprobación de Rutas (Estándar Académico de Qurio), 5. Catálogo de Aprendizaje y Arquitectura Curricular Escalable, RUTA 1: SQL Fundamentals / SQL Developer (Prioridad #1 — MVP Comercial), RUTA 2: Python for Data (Prioridad #2 — MVP Comercial Parte A / Retención Parte B) (+3 more)

### Community 104 - "Button"
Cohesion: 0.09
Nodes (28): AuthConfirmView, NotFoundView, ResetPasswordView, BadgeProps, Button, ButtonProps, ModuleAccordionProps, GithubIcon() (+20 more)

### Community 105 - "3.3 Desarrollo Detallado por Segmento"
Cohesion: 0.22
Nodes (9): 3.1 Regla Estratégica de Secuenciación de Mercado, 3.2 Matriz Resumen de Segmentos, 3.3 Desarrollo Detallado por Segmento, 3. Análisis de Segmentos de Mercado (B2C y B2B), Segmento 1: Estudiantes Universitarios y Principiantes en Tecnología, Segmento 2: Personas que Buscan Conseguir Empleo en Áreas de Datos (*Job Seekers & Career Switchers*), Segmento 3: Profesionales que Desean Actualizar sus Habilidades (*Upskilling*), Segmento 4: Escuelas, Universidades y Academias (+1 more)

### Community 106 - "7.1 Estrategia Go-To-Market (GTM): Foco Inicial México $\to$ Expansión LATAM"
Cohesion: 0.25
Nodes (8): 1. Motor Orgánico en Redes Sociales (TikTok, Instagram Reels, YouTube Shorts y LinkedIn), 2. Retos Semanales Abiertos (*#RetoQurio de la Semana*), 3. Programa de Referidos con Recompensa Funcional (*Give-Get Loop*), 4. Alianzas Académicas y con Profesores Universitarios (*Bottom-Up Academic Adoption*), 5. Alianzas con Comunidades, Academias y Venta Directa a PyMEs, 7.1 Estrategia Go-To-Market (GTM): Foco Inicial México $\to$ Expansión LATAM, 7.2 Embudo Comercial Completo (AARRR) y Métricas por Etapa, 7. Estrategia Comercial, Marketing y Embudo de Crecimiento

### Community 107 - "6. Diagnóstico Forense de las Cinco Brechas de Fase 10"
Cohesion: 0.33
Nodes (6): 6.1 Brecha C-01: Protección de `solution_query`, 6.2 Brecha C-02: Fuente Única de Persistencia y Eliminación de Doble Escritura, 6.3 Brecha C-03: Cálculo de Progreso de Rutas, 6.4 Brecha C-04: Consistencia del Esquema de Datos (`pagos` vs `metodos_pago`), 6.5 Brecha C-05: Enrutamiento y Navegación Web Real, 6. Diagnóstico Forense de las Cinco Brechas de Fase 10

### Community 108 - "3. Especificación Técnica de `C-01` (`PR-10.1`): Protección Estricta de `solution_query`"
Cohesion: 0.22
Nodes (9): 1. Separación de Modelos Pydantic en Backend ([`seed_data.py`](../../apps/api/app/modules/curriculum/seed_data.py)), 2. Revocación de Permiso General y Concesión Explícita de Columnas en PostgreSQL/Supabase, 3.2 Archivos Afectados, 3.3 Riesgo y Requisitos de Seguridad de Credenciales, 3.4 Dependencias, 3.5 Solución Propuesta, 3.7 Criterios de Aceptación de `PR-10.1`, 3.8 Estimación de Complejidad y Orden Recomendado (+1 more)

### Community 109 - "5. Especificación Técnica de `C-03` (`PR-10.3a`): Cálculo Determinista de Progreso por Ruta de Aprendizaje"
Cohesion: 0.33
Nodes (6): 5.1 Diagnóstico Forense, 5.2 Archivos Afectados, 5.3 Riesgo y Dependencias, 5.4 Solución Propuesta, 5. Especificación Técnica de `C-03` (`PR-10.3a`): Cálculo Determinista de Progreso por Ruta de Aprendizaje, Garantías sobre Casos Borde Obligatorios:

### Community 110 - "4. Auditoría Funcional del Núcleo de Aprendizaje"
Cohesion: 0.40
Nodes (5): 4.1 Catálogo Curricular, 4.2 Ejecución SQL y Validación de Seguridad, 4.3 Evaluación Pedagógica Semántica, 4. Auditoría Funcional del Núcleo de Aprendizaje, Resultados Verificados:

### Community 111 - "11.2 Clasificación de Gobernanza: Decisiones Establecidas, Recomendaciones, Hipótesis y Aprobaciones Pendientes"
Cohesion: 0.29
Nodes (7): 11.1 Matriz de Riesgos Estratégicos, Técnicos y Comerciales, 11.2 Clasificación de Gobernanza: Decisiones Establecidas, Recomendaciones, Hipótesis y Aprobaciones Pendientes, 11. Riesgos, Mitigaciones y Gobernanza de Decisiones, A. Decisiones Ya Establecidas (Invariantes del Proyecto), B. Recomendaciones Técnicas y de Producto del Equipo Multidisciplinario (Propuesta Estratégica Documentada), C. Hipótesis Comerciales y Decisiones Pendientes de Validación Final, D. Decisiones Estratégicas y Arquitectónicas Aprobadas por el Propietario del Producto (`D-01` a `D-07`)

### Community 112 - "4.6 Evaluación Técnica y Operativa del Proveedor de Pagos: Stripe México y Alternativas (Decisión Aprobada `D-03`)"
Cohesion: 0.29
Nodes (7): 1. Ciclo de Vida de Suscripciones, Renovaciones y Cancelaciones, 2. Webhooks, Verificación Criptográfica e Idempotencia, 3. Periodos de Gracia (*Dunning*) y Reembolsos / Contracargos, 4.6 Evaluación Técnica y Operativa del Proveedor de Pagos: Stripe México y Alternativas (Decisión Aprobada `D-03`), 4. Métodos de Pago Disponibles en México y Restricciones de Recurrencia, 5. Costos, Comisiones y Aspectos Fiscales que Deben Verificarse, 6. Comparativa de Alternativas Evaluadas para México y LATAM

### Community 117 - "8. Roadmap de Producto de 12 Meses"
Cohesion: 0.33
Nodes (6): 8. Roadmap de Producto de 12 Meses, Etapa 1 (Meses 1–3): MVP Comercial B2C, Etapa 2 (Meses 4–6): Retención y Profundidad Pedagógica, Etapa 3 (Meses 7–9): Preparación Laboral y Pilotos B2B, Etapa 4 (Meses 10–12): Expansión Comercial, BI y Escala Regional, Fase 10 (Pre-Requisito Inmediato): Estabilización Técnica y Preparación Comercial (`C-01` a `C-05`)

### Community 121 - "2.2 Contradicciones y Brechas entre la Visión Comercial y el Estado Actual del Código"
Cohesion: 0.50
Nodes (4): 2.1 Inventario Técnico Verificado en el Código Actual, 2.2 Contradicciones y Brechas entre la Visión Comercial y el Estado Actual del Código, 2.3 Especificación de Seguridad para la Protección de Soluciones (`C-01`), 2. Auditoría del Estado Actual del Repositorio vs. Visión Comercial

## Knowledge Gaps
- **3 isolated node(s):** `Pragmatic Atomic Design`, `Supabase Cloud Authentication & Persistence`, `PostgreSQL Docker Sandbox`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1165 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `QURIO — Product & Business Blueprint` connect `QURIO — Product & Business Blueprint` to `9. Arquitectura Técnica Actual y Evolución SaaS`, `5.4 Desglose Curricular Detallado por Ruta`, `3.3 Desarrollo Detallado por Segmento`, `6.5 Arquitectura de la Experiencia de Invitados (Decisión Aprobada `D-05`)`, `7.1 Estrategia Go-To-Market (GTM): Foco Inicial México $\to$ Expansión LATAM`, `11.2 Clasificación de Gobernanza: Decisiones Establecidas, Recomendaciones, Hipótesis y Aprobaciones Pendientes`, `4. Modelo de Negocio y Estrategia de Monetización`, `8. Roadmap de Producto de 12 Meses`, `2.2 Contradicciones y Brechas entre la Visión Comercial y el Estado Actual del Código`, `BITACORA.md`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Badge()` (e.g. with `3.1 Monorepo y Componentes` and `[2026-11-08] — Entrada 09: Fase 3 — Frontend Base & Atomic Design Pragmático`) actually correct?**
  _`Badge()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Pragmatic Atomic Design`, `Supabase Cloud Authentication & Persistence`, `PostgreSQL Docker Sandbox` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.11836734693877551 - nodes in this community are weakly interconnected._
- **Why does `3. Registro Cronológico de Entradas` connect `3. Registro Cronológico de Entradas` to `cn`, `Badge`, `useTheme.tsx`, `ExercisePublicDTO`, `test_security.py`, `FastAPI Application Lifespan`, `BITACORA.md`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0726764500349406 - nodes in this community are weakly interconnected._
- **Why does `ExercisePublicDTO` connect `ExercisePublicDTO` to `Qurio — Nueva Línea Base Operativa de Desarrollo`, `Reporte de Actualización Documental — Qurio Blueprint v1.1 y Phase 10 Stabilization Plan v1.1`, `router.py`, `test_integration.py`, `router.py`, `3. Especificación Técnica de `C-01` (`PR-10.1`): Protección Estricta de `solution_query``, `sandbox_db`, `8. Roadmap de Producto de 12 Meses`, `2.2 Contradicciones y Brechas entre la Visión Comercial y el Estado Actual del Código`, `computeOfficialTracksProgress`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._