# Reglas del Proyecto — Qurio

Este archivo establece las directrices de ingeniería, estilo y estándares de autenticidad para el desarrollo del proyecto **Qurio**. Cualquier agente o desarrollador que trabaje en esta base de código debe seguir estas normas.

---

## 1. Filosofía de Autenticidad (Anti-AI Slop & Calidad de Producto)

Para garantizar que Qurio se perciba como un producto de ingeniería sólido, profesional y artesanal (evitando el aspecto de "plantilla genérica generada por IA"), se aplican las siguientes directrices obligatorias:

### 1.1 Elementos Obligatorios de UX e Identidad
* **Manejo Riguroso de Errores en Formularios:**
  * Prohibido utilizar `alert()`, `confirm()` nativos del navegador o permitir que los errores queden silenciosos.
  * Todo error de autenticación (Supabase Auth) o validación debe presentarse inline con tipografía clara y tokens del sistema de diseño (color `error: #ffb4ab`, bordes sutiles sin desestructurar el layout).
* **Favicon e Identidad de Marca:**
  * Prohibido dejar el favicon por defecto de Vite o React.
  * Usar el isotipo SVG oficial de Qurio (cilindro relacional en capas con núcleo verde esmeralda activo).
* **Página 404 Personalizada y Tematizada:**
  * Si el usuario accede a una ruta inexistente, renderizar una página 404 estilizada con la estética *Terminal Glow Minimal* y metáfora técnica de SQL (ej. `ERROR 404: Relation 'route' does not exist in schema public`), con acceso directo para volver al Dashboard.
* **Meta Títulos Dinámicos:**
  * Cada pantalla debe actualizar dinámicamente el `document.title` de la pestaña del navegador:
    * Ejercicio: `[Nombre del Reto] — [Ruta] | Qurio`
    * Playground: `SQL Playground | Qurio`
    * Dashboard: `Dashboard | Qurio`
* **Adaptabilidad Responsiva Real (Mobile & Tablet):**
  * Respetar los breakpoints y el layout definido en los mockups: Monaco Editor no debe encogerse hasta ser inusable; en pantallas móviles debe adoptar el sistema de pestañas apiladas (*Editor*, *Consigna*, *Resultados*) con el botón de ejecución fijo en la barra inferior.
* **Accesibilidad Web (a11y):**
  * Atributos `alt` descriptivos obligatorios en todas las imágenes y avatares.
  * Atajos de teclado documentados visualmente en `JetBrains Mono` (`⌘ + Enter` para ejecutar, `⌘ + K` para búsqueda rápida).
* **Open Graph (OG Tags):**
  * Metadatos `og:title`, `og:description` e imagen `og:image` institucional con estética oscura y lema: *"Aprende SQL. Piensa en queries."* para previsualizaciones en redes y mensajería.
* **Contacto Transparente y Real:**
  * Prohibido incluir direcciones postales falsas o pies de página de relleno (tipo *"123 Innovation St, San Francisco"*). Enlazar a repositorios reales de GitHub, perfiles o correos de soporte auténticos.
* **Términos y Privacidad Claros:**
  * Redacción breve, humana y transparente (qué datos se guardan, cómo se protegen y que no se comparten con terceros), sin biblias jurídicas innecesarias.

### 1.2 Anti-Patrones Prohibidos (Cosas que NO se deben implementar)
* **Banners de Cookies Invasivos:** Al no usar cookies de rastreo publicitario de terceros (solo tokens de sesión JWT), está prohibido agregar banners invasivos de cookies.
* **Páginas de Gracias Innecesarias:** Qurio es una aplicación técnica interactiva, no un embudo de ventas de ecommerce. El flujo de éxito es el modal de recompensa/XP y avance directo.
* **Pipelines de Optimización Prematura:** Los activos visuales principales son vectores SVG matemáticos puros (0 KB). No añadir dependencias de compresión innecesarias.

### 1.3 Atomic Design Pragmático (Regla Estricta de Organización UI)
Toda la interfaz visual de Qurio en React debe estructurarse obligatoriamente bajo **Atomic Design Pragmático** (inspirado en [UI From Mars](https://uifrommars.com/atomic-design-ventajas/)):
* **Prohibido crear componentes fuera del árbol:** Ningún componente visual reutilizable debe existir disperso en carpetas de utilidades o suelto dentro de `src/`. Todo componente pertenece estrictamente a uno de los 4 niveles del árbol:
  1. **Átomos (`src/components/atoms/`):** Bloques indivisibles de diseño con tokens de *Terminal Glow Minimal* (`Button`, `Badge`, `TextInput`, `KbdShortcut`, `RadioTab`).
  2. **Moléculas (`src/components/molecules/`):** Grupos de átomos que forman una unidad funcional simple (`SearchInput` = Input + Kbd + Icono, `StreakPill` = Icono llama + Días en JetBrains Mono, `FormField` = Label + Input + Error inline, `MetricTile`).
  3. **Organismos (`src/components/organisms/`):** Módulos complejos y autónomos de la interfaz (`SidebarNav`, `TopHeader`, `MonacoEditorPanel`, `DataGridResults`, `BentoStatsGrid`).
  4. **Plantillas (`src/components/templates/`):** Layouts estructurales de página sin datos cableados (`WorkspaceLayout` con paneles 30/70, `DashboardLayout`).
* **Enfoque Pragmático (Anti-Dogmático):**
  * Prohibido crear átomos artificiales de envoltorio para etiquetas HTML que no aportan diseño, variantes ni estados compartidos.
  * Los contenedores de página (`src/features/` o `src/pages/`) únicamente conectan el estado global/API y ensamblan organismos dentro de una plantilla; nunca contienen estilos de componentes embebidos que deberían ser parte del sistema de diseño.

---

## 2. Estándares Técnicos y Arquitectura

* **Frontend:** React 18+ con TypeScript estricto (`strict: true`). Organización de estilos mediante Tailwind CSS 3.4 siguiendo la especificación [`docs/stitch_qurio_interactive_sql_platform/.../DESIGN.md`](file:///c:/Desarrollo/Qurio/docs/stitch_qurio_interactive_sql_platform/stitch_qurio_interactive_sql_platform/terminal_glow_minimal/DESIGN.md).
* **Backend:** FastAPI (Python 3.12) con tipado Pydantic estricto en todos los esquemas de entrada y salida.
* **Seguridad de Ejecución (Regla de Oro):** Ninguna consulta introducida por un usuario debe tener conectividad ni ejecutarse jamás contra la base de datos de producción (Supabase). Todas las queries de práctica corren exclusivamente en el PostgreSQL Sandbox aislado en Docker bajo el rol `readonly_student` y con `statement_timeout = 2000ms`.
* **Evaluación Semántica:** Las aserciones deben evaluar conjuntos de datos (filas, columnas, nulos y tipos), no comparar cadenas de texto SQL.
* **Flujo Git y Ramas (Obligatorio):**
  * Toda implementación grande o nueva funcionalidad debe trabajarse en su propia rama de características (`feat/...`, `infra/...`, `fix/...`).
  * Solo se fusiona (`merge`) a `main` cuando la funcionalidad esté completada y verificada.
  * Todos los cambios y ramas deben sincronizarse y enviarse a GitHub (`git push`).
