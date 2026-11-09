# Graph Report - Qurio  (2026-11-09)

## Corpus Check
- 140 files · ~154,453 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .example 2, .ini 1)

## Summary
- 430 nodes · 986 edges · 29 communities (16 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.87)
- Token cost: 1,200 input · 450 output

## Community Hubs (Navigation)
- Atomic Design UI Library
- Interactive Exercise Workspace
- Docker Sandbox Infrastructure
- Frontend Package Ecosystem
- Supabase Cloud Authentication Context
- Integration Testing Fixtures
- TypeScript Web Compilation Configuration
- Curriculum Repository and Settings
- SQL AST Security Guard
- Database Connection Pool Service
- Gamification and Navigation Molecules
- FastAPI Runner Router Endpoints
- Semantic Evaluation Engine Suite
- FastAPI Application Lifespan
- TypeScript Node Configuration
- Exercise Catalog Query Routes
- Cell and Tuple Normalization
- Automated Quality Gate Scripts
- Design System and Architecture Concepts
- Agent Workflow Automation Shell
- PostgreSQL Sandbox & Evaluator

## God Nodes (most connected - your core abstractions)
1. `cn()` - 47 edges
2. `react` - 36 edges
3. `Button` - 34 edges
4. `Badge()` - 30 edges
5. `lucide-react` - 26 edges
6. `App()` - 23 edges
7. `evaluate_solution()` - 18 edges
8. `compilerOptions` - 17 edges
9. `validate_sql_security()` - 15 edges
10. `EvaluationStatus` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Supabase Cloud Authentication & Persistence` --provides_auth_context_to--> `Pragmatic Atomic Design`  [INFERRED]
  database/supabase/01_schema.sql → AGENTS.md
- `Semantic SQL Evaluator` --executes_against--> `PostgreSQL Docker Sandbox`  [INFERRED]
  apps/api/app/services/evaluator.py → AGENTS.md
- `Terminal Glow Minimal Design System` --governs_styling_of--> `Pragmatic Atomic Design`  [INFERRED]
  docs/stitch_qurio_interactive_sql_platform/DESIGN.md → AGENTS.md
- `evaluate_solution()` --uses--> `ExecutionResult`  [INFERRED]
  apps/api/app/modules/runner/evaluator.py → apps/api/app/modules/runner/schemas.py
- `SandboxRunner` --uses--> `ExecutionResult`  [INFERRED]
  apps/api/app/modules/runner/service.py → apps/api/app/modules/runner/schemas.py

## Import Cycles
- None detected.

## Communities (29 total, 13 thin omitted)

### Community 0 - "Atomic Design UI Library"
Cohesion: 0.10
Nodes (51): App(), Badge(), BadgeProps, Button, ButtonProps, KbdShortcut(), KbdShortcutProps, TextInput (+43 more)

### Community 1 - "Interactive Exercise Workspace"
Cohesion: 0.07
Nodes (43): AppPath, ModuleAccordionProps, SchemaTableItem(), SchemaTableItemProps, TrackCardProps, DataGridResultsProps, ExerciseSpecPanelProps, MonacoEditorPanel() (+35 more)

### Community 2 - "Docker Sandbox Infrastructure"
Cohesion: 0.05
Nodes (42): build, container_name, depends_on, environment, networks, ports, restart, context (+34 more)

### Community 3 - "Frontend Package Ecosystem"
Cohesion: 0.07
Nodes (37): dependencies, clsx@^2.1.1, lucide-react@^1.16.0, @monaco-editor/react@^4.7.0, react@^18.3.1, react-dom@^18.3.1, tailwind-merge@^2.6.0, devDependencies (+29 more)

### Community 4 - "Supabase Cloud Authentication Context"
Cohesion: 0.11
Nodes (21): @supabase/supabase-js@^2.49.1, UserProfileViewProps, AuthContext, AuthContextType, AuthProvider(), getInitialTheme(), syncDOMWithTheme(), Theme (+13 more)

### Community 5 - "Integration Testing Fixtures"
Cohesion: 0.18
Nodes (10): client(), init_sandbox_pool(), test_health_endpoint(), test_list_and_get_exercises(), test_playground_execute_security_block(), test_playground_execute_syntax_error(), test_playground_execute_valid_query(), test_submit_exercise_partial_or_wrong_columns() (+2 more)

### Community 6 - "TypeScript Web Compilation Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+11 more)

### Community 7 - "Curriculum Repository and Settings"
Cohesion: 0.16
Nodes (5): Settings, ExerciseRepository, ExerciseConcept, ExerciseDetail, SampleTableData

### Community 8 - "SQL AST Security Guard"
Cohesion: 0.20
Nodes (13): enforce_row_limit(), strip_sql_comments(), validate_sql_security(), test_block_alter_table(), test_block_dangerous_functions(), test_block_delete(), test_block_drop_table(), test_block_insert() (+5 more)

### Community 9 - "Database Connection Pool Service"
Cohesion: 0.14
Nodes (3): ColumnInfo, SandboxRunner, serialize_value()

### Community 10 - "Gamification and Navigation Molecules"
Cohesion: 0.18
Nodes (12): RadioTab(), RadioTabProps, AchievementCard(), AchievementCardProps, ICON_MAP, AchievementsView(), AchievementsViewProps, CATEGORIES (+4 more)

### Community 11 - "FastAPI Runner Router Endpoints"
Cohesion: 0.25
Nodes (7): execute_playground_query(), submit_exercise_solution(), DiffResult, EvaluationResponse, ExecutionResult, ExerciseSubmitRequest, QueryExecuteRequest

### Community 12 - "Semantic Evaluation Engine Suite"
Cohesion: 0.41
Nodes (11): evaluate_solution(), EvaluationStatus, make_result(), test_evaluator_column_count_mismatch(), test_evaluator_column_name_mismatch(), test_evaluator_database_error(), test_evaluator_exact_match(), test_evaluator_hint_penalties() (+3 more)

### Community 14 - "TypeScript Node Configuration"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 15 - "Exercise Catalog Query Routes"
Cohesion: 0.29
Nodes (3): get_exercise(), health_check(), list_exercises()

### Community 18 - "Design System and Architecture Concepts"
Cohesion: 0.67
Nodes (3): Pragmatic Atomic Design, Supabase Cloud Authentication & Persistence, Terminal Glow Minimal Design System

## Knowledge Gaps
- **4 isolated node(s):** `Terminal Glow Minimal Design System`, `PostgreSQL Docker Sandbox`, `Supabase Cloud Authentication & Persistence`, `Semantic SQL Evaluator`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 159 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Atomic Design UI Library` to `Interactive Exercise Workspace`, `Gamification and Navigation Molecules`, `Frontend Package Ecosystem`, `Supabase Cloud Authentication Context`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `Terminal Glow Minimal Design System`, `PostgreSQL Docker Sandbox`, `Supabase Cloud Authentication & Persistence` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Atomic Design UI Library` be split into smaller, more focused modules?**
  _Cohesion score 0.09756909756909757 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Atomic Design UI Library` to `Interactive Exercise Workspace`, `Gamification and Navigation Molecules`, `Frontend Package Ecosystem`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `Interactive Exercise Workspace` be split into smaller, more focused modules?**
  _Cohesion score 0.07372549019607844 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `Atomic Design UI Library` to `Interactive Exercise Workspace`, `Gamification and Navigation Molecules`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `Docker Sandbox Infrastructure` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._