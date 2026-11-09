# Graph Report - Qurio  (2026-11-09)

## Corpus Check
- 136 files · ~178,949 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .example 2, .ini 1)

## Summary
- 1493 nodes · 2292 edges · 96 communities (77 shown, 19 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 165 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b2aeef73`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- Interactive Exercise Workspace
- Docker Sandbox Infrastructure
- Frontend Package Ecosystem
- Supabase Cloud Authentication Context
- test_integration.py
- TypeScript Web Compilation Configuration
- Curriculum Repository and Settings
- test_security.py
- router.py
- types/index.ts
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
- Badge
- Qurio — Plataforma Interactiva de Aprendizaje SQL & Analítica Relacional
- Qurio — Product Requirements Document (PRD)
- Qurio — Software Architecture Document (SAD)
- Code Review and Quality
- Test-Driven Development
- Context Engineering
- test_auth.py
- react
- Git Workflow and Versioning
- Optimization Patterns
- Shipping and Launch
- API and Interface Design
- Browser Testing with DevTools
- Frontend UI Engineering
- 3. Registro Cronológico de Entradas
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
- DESIGN.md
- Source-Driven Development
- Refinement & Evaluation Criteria
- DashboardLayout.tsx
- SQL Academy --- Propuesta de producto y arquitectura del MVP
- dependencies
- useTheme.tsx
- Ideation Frameworks Reference
- Ponytail Help
- InMemoryRateLimiter
- conftest.py
- Modalidades de aprendizaje
- 4. Arquitectura técnica
- 1. Fases del Proyecto
- ponytail-audit/SKILL.md
- Ponytail Gain
- ponytail-review/SKILL.md
- Ponytail
- scripts
- Bitácora de Desarrollo — Qurio
- ponytail-debt/SKILL.md
- decode_jwt_token
- Settings
- test_guest_rate_limit
- 15. Documentación técnica que debe elaborarse
- 6. Motor de evaluación SQL
- Declaración de Intención: Qurio MVP
- 12. Diseño visual e identidad
- 14. Criterios de calidad
- 1. Visión del producto
- 5. Diseño de la base de datos principal
- 8. Gamificación y experiencia profesional
- 9. Alcance del MVP

## God Nodes (most connected - your core abstractions)
1. `cn()` - 48 edges
2. `react` - 36 edges
3. `Badge()` - 35 edges
4. `Button` - 34 edges
5. `3. Registro Cronológico de Entradas` - 28 edges
6. `validate_sql_security()` - 27 edges
7. `evaluate_solution()` - 26 edges
8. `lucide-react` - 26 edges
9. `App()` - 25 edges
10. `EvaluationStatus` - 20 edges

## Surprising Connections (you probably didn't know these)
- `[2026-11-09] — Entrada 21: Experiencia de Autenticación, Toggle de Contraseña y Vistas del Sistema` --references--> `AuthModal()`  [INFERRED]
  docs/BITACORA.md → apps/web/src/components/molecules/AuthModal/AuthModal.tsx
- `Entrada 24 — Generación del Grafo de Conocimiento y Visualización Interactiva con Graphify` --references--> `evaluate_solution()`  [INFERRED]
  docs/BITACORA.md → apps/api/app/modules/runner/evaluator.py
- `Entrada 24 — Generación del Grafo de Conocimiento y Visualización Interactiva con Graphify` --references--> `validate_sql_security()`  [INFERRED]
  docs/BITACORA.md → apps/api/app/modules/runner/security.py
- `Entrada 26 — Fase 9: Hardening de Seguridad, Análisis AST con SQLGlot y Autoridad Central de Progreso` --references--> `enforce_row_limit()`  [INFERRED]
  docs/BITACORA.md → apps/api/app/modules/runner/security.py
- `2.2 Conservación del Índice Único Parcial en el Procedimiento de Rollback` --references--> `test_rollback_script_preserves_strict_security()`  [INFERRED]
  docs/security/SECURITY_REMEDIATION_RESULTS.md → apps/api/tests/test_supabase_migration.py

## Import Cycles
- None detected.

## Communities (96 total, 19 thin omitted)

### Community 0 - "cn"
Cohesion: 0.16
Nodes (17): KbdShortcut(), KbdShortcutProps, RadioTabProps, TextInput, TextInputProps, AuthModalProps, AuthMode, FormField (+9 more)

### Community 1 - "Interactive Exercise Workspace"
Cohesion: 0.09
Nodes (26): AppPath, SchemaTableItemProps, ExerciseSpecPanelProps, SpecTab, extractTableAliases(), registerSqlCompletionProvider(), SQL_KEYWORDS, SqlPlaygroundViewProps (+18 more)

### Community 2 - "Docker Sandbox Infrastructure"
Cohesion: 0.05
Nodes (42): build, container_name, depends_on, environment, networks, ports, restart, context (+34 more)

### Community 3 - "Frontend Package Ecosystem"
Cohesion: 0.12
Nodes (21): devDependencies, autoprefixer@^10.4.20, postcss@^8.4.49, tailwindcss@^3.4.17, @types/react@^18.3.18, @types/react-dom@^18.3.5, typescript@^5.7.3, vite@^6.2.0 (+13 more)

### Community 4 - "Supabase Cloud Authentication Context"
Cohesion: 0.18
Nodes (15): @supabase/supabase-js@^2.49.1, UserProfileViewProps, AuthContext, AuthContextType, ExerciseAttemptData, persistence, isSupabaseConfigured, rawUrl (+7 more)

### Community 5 - "test_integration.py"
Cohesion: 0.36
Nodes (11): test_health_endpoint(), test_list_and_get_exercises(), test_playground_blocked_cte_delete(), test_playground_execute_security_block(), test_playground_execute_syntax_error(), test_playground_execute_valid_query(), test_playground_recursive_cte_timeout(), test_playground_string_with_semicolon() (+3 more)

### Community 6 - "TypeScript Web Compilation Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+11 more)

### Community 7 - "Curriculum Repository and Settings"
Cohesion: 0.25
Nodes (4): ExerciseRepository, ExerciseConcept, ExerciseDetail, SampleTableData

### Community 8 - "test_security.py"
Cohesion: 0.07
Nodes (28): inspect_pedagogical_requirements(), enforce_row_limit(), strip_sql_comments(), validate_sql_security(), test_all_18_curriculum_queries_pass_security(), test_allow_parenthesized_subqueries(), test_allow_recursive_cte(), test_allow_set_operations_union_intersect_except() (+20 more)

### Community 10 - "types/index.ts"
Cohesion: 0.14
Nodes (18): AchievementCardProps, ICON_MAP, ModuleAccordionProps, StreakPillProps, TrackCardProps, AchievementsViewProps, CATEGORIES, TracksViewProps (+10 more)

### Community 11 - "AuthenticatedUser"
Cohesion: 0.22
Nodes (5): AuthenticatedUser, check_rate_limit(), get_client_ip(), execute_playground_query(), submit_exercise_solution()

### Community 12 - "evaluate_solution"
Cohesion: 0.08
Nodes (27): evaluate_solution(), normalize_cell(), row_to_comparable_tuple(), ColumnInfo, DiffResult, EvaluationResponse, EvaluationStatus, ExecutionResult (+19 more)

### Community 13 - "FastAPI Application Lifespan"
Cohesion: 0.18
Nodes (4): add_security_headers(), lifespan(), root(), [2026-11-07] — Entrada 08: Fase 2 — Motor de Ejecución y Evaluación en FastAPI

### Community 14 - "TypeScript Node Configuration"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 15 - "Exercise Catalog Query Routes"
Cohesion: 0.29
Nodes (3): get_exercise(), health_check(), list_exercises()

### Community 16 - "test_supabase_migration.py"
Cohesion: 0.06
Nodes (24): create_test_user(), db_conn(), setup_mock_supabase_environment(), test_authoritative_xp_calculation_across_rewards_and_hints(), test_concurrent_different_exercises_no_lost_updates(), test_concurrent_same_exercise_independent_connections(), test_effective_privileges_matrix(), test_first_pass_with_zero_xp_counts_as_passed() (+16 more)

### Community 29 - "Hardening Controls"
Cohesion: 0.05
Nodes (42): Broken Access Control, Broken Authentication, Cross-Site Scripting (XSS), Data Classification, Dependency Audit Triage, Destructive Operations on Derived Paths, File Upload Safety, Hardening Patterns (+34 more)

### Community 30 - "Badge"
Cohesion: 0.19
Nodes (37): App(), Badge(), RadioTab(), AchievementCard(), AuthModal(), MetricTile(), ModuleAccordion(), SchemaTableItem() (+29 more)

### Community 31 - "Qurio — Plataforma Interactiva de Aprendizaje SQL & Analítica Relacional"
Cohesion: 0.06
Nodes (32): 1. Aislamiento del Sandbox de Ejecución (PostgreSQL en Docker), 1. Clonar el Repositorio, 2. Blindaje de Backend y Supabase Cloud (Hardening v5.0), 2. Estética *Terminal Glow Minimal*, 2. Iniciar el Sandbox PostgreSQL (Docker), 3. Configurar y Ejecutar la API (FastAPI), 4. Configurar y Ejecutar el Frontend (React + Vite), 5. Ejecutar la Suite de Pruebas Automatizadas (+24 more)

### Community 32 - "Qurio — Product Requirements Document (PRD)"
Cohesion: 0.06
Nodes (30): 1.1 Declaración de Visión, 1.2 Objetivos del MVP, 1. Visión y Objetivos del Producto, 2. Mapa de Capacidades del MVP (Capability Map), 3.1 Perfil Principal: El Autodidacta Pragmático (Junior Dev / Analista de Datos), 3. Personas y Usuarios Objetivo, 4. Historias de Usuario y Criterios de Aceptación (Gherkin), 5.1 Módulo 1: Autenticación y Usuarios (`auth-profile`) (+22 more)

### Community 33 - "Qurio — Software Architecture Document (SAD)"
Cohesion: 0.06
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
Cohesion: 0.12
Nodes (10): get_optional_current_user(), get_required_current_user(), ec_key_pair(), make_valid_token(), test_expired_token_raises_401(), test_guest_user_when_no_authorization_header(), test_malformed_header_raises_401(), test_required_user_rejects_guest() (+2 more)

### Community 38 - "react"
Cohesion: 0.17
Nodes (17): BadgeProps, Button, ButtonProps, SuccessModalProps, AuthConfirmView(), AuthConfirmViewProps, DataGridResultsProps, MonacoEditorPanelProps (+9 more)

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

### Community 45 - "3. Registro Cronológico de Entradas"
Cohesion: 0.10
Nodes (24): SuccessModal(), ExerciseSpecPanel(), [2026-11-07] — Entrada 01: Inicio, Inspección y Setup de Skills, [2026-11-07] — Entrada 02: Revisión del Sistema de Diseño Visual, [2026-11-07] — Entrada 03: Entrevista de Requerimientos y Declaración de Intención, [2026-11-07] — Entrada 04: Especificación Técnica (PRD y SAD), [2026-11-07] — Entrada 05: Directrices de Autenticidad y Atomic Design Pragmático, [2026-11-07] — Entrada 06: Conexión Inicial con GitHub (+16 more)

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

### Community 63 - "DESIGN.md"
Cohesion: 0.14
Nodes (13): Botones de Acción, Brand & Style, Casillas de Verificación y Selección (Checkboxes), Chips y Filtros, Colors, Components, Editor de Código y Consola, Elevation & Depth (+5 more)

### Community 64 - "Source-Driven Development"
Cohesion: 0.15
Nodes (12): Common Rationalizations, Overview, Red Flags, Retrieval Safety: Treat Fetched Content as Data, Source-Driven Development, Step 1: Detect Stack and Versions, Step 2: Fetch Official Documentation, Step 3: Implement Following Documented Patterns (+4 more)

### Community 65 - "Refinement & Evaluation Criteria"
Cohesion: 0.17
Nodes (11): 1. User Value, 2. Feasibility, 3. Differentiation, Assumption Audit, Core Evaluation Dimensions, Decision Framework, Might Be True (Nice to Have), Must Be True (Dealbreakers) (+3 more)

### Community 66 - "DashboardLayout.tsx"
Cohesion: 0.26
Nodes (9): GithubIcon(), PrivacyModal(), PrivacyModalProps, NotFoundView(), DashboardLayout(), DashboardLayoutProps, GithubIcon(), [2026-11-09] — Entrada 14: Fase 6 — Autenticidad, Calidad & Estándares Anti-AI Slop (+1 more)

### Community 67 - "SQL Academy --- Propuesta de producto y arquitectura del MVP"
Cohesion: 0.17
Nodes (11): 10. Estructura del repositorio, 11. API inicial, 13. Plan de desarrollo, 16. Decisiones pendientes, 17. Principios del proyecto, 18. Próximo paso recomendado, 3. Rutas de aprendizaje, 7. Seguridad del motor de ejecución (+3 more)

### Community 68 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, clsx@^2.1.1, lucide-react@^1.16.0, @monaco-editor/react@^4.7.0, react@^18.3.1, react-dom@^18.3.1, tailwind-merge@^2.6.0, clsx (+3 more)

### Community 69 - "useTheme.tsx"
Cohesion: 0.24
Nodes (8): AuthProvider(), getInitialTheme(), syncDOMWithTheme(), Theme, ThemeContext, ThemeContextType, ThemeProvider(), Entrada 23 — Arquitectura Canónica de Autenticación React (AuthProvider), Inicio y Cierre de Sesión Real

### Community 70 - "Ideation Frameworks Reference"
Cohesion: 0.22
Nodes (8): Analogous Inspiration, Constraint-Based Ideation, First Principles Thinking, How Might We (HMW), Ideation Frameworks Reference, Jobs to Be Done (JTBD), Pre-mortem, SCAMPER

### Community 71 - "Ponytail Help"
Cohesion: 0.22
Nodes (8): Band (Claude Code), Configure Default Mode, Deactivate, Levels, More, Ponytail Help, Skills, Update

### Community 74 - "Modalidades de aprendizaje"
Cohesion: 0.29
Nodes (7): 2. Arquitectura funcional, A. Editor SQL interactivo, B. Retos de resolución de problemas, C. Laboratorio de bases de datos, D. Desafíos de optimización, E. Proyectos prácticos, Modalidades de aprendizaje

### Community 75 - "4. Arquitectura técnica"
Cohesion: 0.29
Nodes (7): 4. Arquitectura técnica, A. Application Database, Arquitectura lógica, B. SQL Execution Engine, Enfoque arquitectónico, Separación de bases de datos, Stack tecnológico

### Community 76 - "1. Fases del Proyecto"
Cohesion: 0.29
Nodes (6): 1. Fases del Proyecto, Fase 1: Cimientos de Datos & Docker (`feat/database-and-docker-infra`), Fase 2: Motor de Ejecución y Evaluación (`feat/fastapi-runner-evaluator`), Fase 5: Rutas, Playground y Gamificación (`feat/curriculum-and-gamification`), Fase 6: Autenticidad, Pulido y Despliegue (`feat/authenticity-and-polish`), Plan de Implementación General — Qurio MVP

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

### Community 81 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 82 - "Bitácora de Desarrollo — Qurio"
Cohesion: 0.40
Nodes (4): 1. Estado Actual del Proyecto, 2. Tablero de Control de Fases, 4. Estado de la Integración con Supabase Cloud, Bitácora de Desarrollo — Qurio

### Community 83 - "ponytail-debt/SKILL.md"
Cohesion: 0.50
Nodes (3): Boundaries, Output, Scan

### Community 87 - "15. Documentación técnica que debe elaborarse"
Cohesion: 0.50
Nodes (4): 15.1 Product Requirements Document (PRD), 15.2 Software Architecture Document (SAD), 15.3 Database Design Document, 15. Documentación técnica que debe elaborarse

### Community 88 - "6. Motor de evaluación SQL"
Cohesion: 0.50
Nodes (4): 6. Motor de evaluación SQL, Criterios de evaluación, Ejemplo de equivalencia semántica, Flujo de evaluación

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

## Knowledge Gaps
- **3 isolated node(s):** `Pragmatic Atomic Design`, `Supabase Cloud Authentication & Persistence`, `PostgreSQL Docker Sandbox`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 949 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Entrada 24 — Generación del Grafo de Conocimiento y Visualización Interactiva con Graphify` connect `Badge` to `test_security.py`, `cn`, `evaluate_solution`, `3. Registro Cronológico de Entradas`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Badge()` (e.g. with `[2026-11-08] — Entrada 09: Fase 3 — Frontend Base & Atomic Design Pragmático` and `Entrada 24 — Generación del Grafo de Conocimiento y Visualización Interactiva con Graphify`) actually correct?**
  _`Badge()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Pragmatic Atomic Design`, `Supabase Cloud Authentication & Persistence`, `PostgreSQL Docker Sandbox` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Interactive Exercise Workspace` be split into smaller, more focused modules?**
  _Cohesion score 0.09269162210338681 - nodes in this community are weakly interconnected._
- **Why does `evaluate_solution()` connect `evaluate_solution` to `test_security.py`, `router.py`, `AuthenticatedUser`, `Badge`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `Docker Sandbox Infrastructure` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Why does `Badge()` connect `Badge` to `cn`, `Interactive Exercise Workspace`, `DashboardLayout.tsx`, `react`, `types/index.ts`, `3. Registro Cronológico de Entradas`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._