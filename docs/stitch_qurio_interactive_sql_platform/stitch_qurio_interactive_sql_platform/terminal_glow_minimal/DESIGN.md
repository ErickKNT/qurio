---
name: Terminal Glow Minimal
colors:
  surface: '#0e1323'
  surface-dim: '#0e1323'
  surface-bright: '#34394a'
  surface-container-lowest: '#080d1d'
  surface-container-low: '#161b2b'
  surface-container: '#1a1f30'
  surface-container-high: '#25293a'
  surface-container-highest: '#2f3446'
  on-surface: '#dee1f9'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dee1f9'
  inverse-on-surface: '#2b3041'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#4ae176'
  on-tertiary: '#003915'
  tertiary-container: '#00a74b'
  on-tertiary-container: '#003111'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#0e1323'
  on-background: '#dee1f9'
  surface-variant: '#2f3446'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.25rem
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 0.9375rem
    fontWeight: '500'
    lineHeight: 1.6rem
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.45rem
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '400'
    lineHeight: 1.125rem
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

Este sistema de diseño fusiona la precisión técnica y quirúrgica de un IDE contemporáneo con la energía propulsiva y gratificante del aprendizaje gamificado. Toma como base la ergonomía visual de entornos como Linear y Monaco/VS Code, integrando micro-recompensas lúcidas (XP, rachas de ejecución, validaciones en tiempo real) inspiradas en dinámicas de aprendizaje modernas sin sacrificar la madurez visual para desarrolladores.

El lenguaje visual es sobrio, dominado por superficies oscuras profundas que reducen la fatiga cognitiva durante largas sesiones frente a consolas y editores. El tono se proyecta analítico, enfocado y empoderador: cada interacción —desde la pulsación de teclas en el editor SQL hasta la resolución exitosa de un test unitario sobre tablas relacionales— debe comunicar velocidad instantánea, retroalimentación táctil digital y rigor de ingeniería.

## Colors

La paleta cromática se estructura en torno a capas de profundidad en noche profunda (*midnight*), utilizando contrastes nítidos para jerarquías tipográficas y acentos luminosos de alta saturación para estados de ejecución y sintaxis SQL.

- **Fondo Base (`#0B1020`)**: Lienzo global para el editor, terminales y la consola de consultas.
- **Fondo Secundario (`#111827`)**: Paneles laterales de esquemas, barras de herramientas y navegación contextual.
- **Superficie de Componente (`#172033`)**: Tarjetas de ejercicios, modales de lecciones y bloques de inspección de datos.
- **Bordes e Hilvanado Estructural (`#1E293B`)**: Delimitadores ultra-precisos de paneles, separadores de código y tablas relacionales.
- **Primario Indigo (`#6366F1`)**: Botones primarios de ejecución ("Ejecutar Query"), estados de selección activa y progreso nuclear.
- **Acento Cyan (`#38BDF8`)**: Palabras clave de control SQL (`SELECT`, `JOIN`, `GROUP BY`), tooltips de optimización de índices y badges de nivel.
- **Éxito Esmeralda (`#22C55E`)**: Aserciones superadas, queries optimizadas al 100% y gamificación de rachas (*streak*).
- **Advertencia Ámbar (`#F59E0B`)**: Queries de costo computacional elevado, advertencias sintácticas y multiplicadores de experiencia temporales.
- **Texto Principal (`#F8FAFC`)**: Contenido de código, enunciados primarios y métricas clave.
- **Texto Secundario (`#94A3B8`)**: Comentarios SQL, metadatos de tabla (`NULLABLE`, tipos de dato) y descripciones auxiliares.

## Typography

La estructura tipográfica se divide estrictamente según el propósito funcional:

1. **Interfaz de Usuario y Narrativa (`Inter`)**: Gestiona títulos de lecciones, instrucciones de problemas, microcopia conversacional y feedback de errores. Presenta un tracking ligeramente cerrado en jerarquías mayores para condensar espacio de lectura.
2. **Entorno de Datos y Código (`JetBrains Mono`)**: Empleado no solo para el editor SQL, sino para todo dato que implique rigor técnico: metadatos de columnas (`VARCHAR(255)`, `BIGINT`), métricas de tiempo de ejecución (`12ms`, `cost: 0.42`), atajos de teclado (`⌘ + Enter`), insignias de nivel y etiquetas de estado. Sus ligaduras y balance óptico aportan claridad inmediata en delimitadores y operadores booleanos.

## Layout & Spacing

El diseño prioriza un entorno tipo estación de trabajo (*workspace*), distribuyendo el espacio en paneles desacoplables y zonas de lectura adaptativas:

- **Estructura de Escritorio (Desktop)**: Modelo dividido de múltiples columnas funcionales con división redimensionable:
  - Panel izquierdo (25-30% del ancho): Instrucciones, objetivos del ejercicio y visor de esquema de base de datos relacional.
  - Panel central/derecho (70-75% del ancho): Editor de consultas superior con terminal/visor de tablas de resultados (*data grid*) inferior.
- **Estructura Móvil/Tablet**: Sistema de pestañas apiladas (*Editor*, *Resultado*, *Consigna*) con barra de acción fija en la parte inferior para ejecutar consultas sin perder visibilidad del código.
- **Ritmo Espacial**: Se utiliza un sistema de retícula derivado de múltiplos de 4px con un espaciado base de condensación técnica (`space-sm` de 8px para paddings en celdas de datos, `space-md` de 12px para paneles y toolbars).

## Elevation & Depth

La jerarquía visual se resuelve mediante estratificación tonal y luminiscencia perimetral, descartando sombras difusas convencionales que ensucien el contraste oscuro:

- **Estratificación Tonal**:
  - Nivel 0 (Fondo General): `#0B1020`
  - Nivel 1 (Superficies de Contenedores y Editores): `#111827`
  - Nivel 2 (Paneles flotantes, Menús contextuales y Celdas destacadas): `#172033`
- **Bordes Luminescentes y Trazos Fantasma**:
  - Los contenedores se separan con un borde continuo de 1px en `#1E293B`.
  - Los estados interactivos, activos o en ejecución aplican un resplandor perimetral sutil (*subtle border luminescence*): `box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.4), 0 0 16px -4px rgba(99, 102, 241, 0.2)`.
  - La ejecución exitosa transiciona el borde del editor hacia una luminiscencia verde esmeralda: `0 0 0 1px rgba(34, 197, 94, 0.5), 0 0 20px -6px rgba(34, 197, 94, 0.25)`.
- **Efectos de Profundidad**: Fondos semi-translúcidos con desenfoque (`backdrop-filter: blur(12px)`) aplicados exclusivamente a la barra de estado superior fija y a modales de solución técnica.

## Shapes

El sistema adopta una escala de curvaturas intermedias (10px a 14px) que suaviza la severidad del software técnico tradicional sin restarle orden sistemático:

- **Componentes Pequeños (Badges, inputs, chips de tipo de dato)**: Radio de 6px a 8px para preservar legibilidad en escalas densas.
- **Componentes Estándar (Botones, campos de código, tarjetas de lección)**: Radio de 10px a 12px (`0.625rem` a `0.75rem`), aportando tactilidad moderna.
- **Contenedores Principales (Marco del editor Monaco, paneles de resultados, modales de subida de nivel)**: Radio de 14px (`0.875rem`) con recortes limpios y precisos.

## Components

### Botones de Acción
- **Ejecutar Consulta (Primario)**: Fondo en degradado controlado o sólido `#6366F1`, texto en `#F8FAFC` en `Inter Semibold 14px`, radio de 10px, con atajo visible en JetBrains Mono (`⌘↵`). Al hover, borde con halo `#38BDF8`.
- **Secundario (Explicar Plan / Formatear SQL)**: Superficie `#172033`, borde de 1px en `#1E293B`, texto `#94A3B8`. Al hover, texto pasa a `#F8FAFC` y borde a `#6366F1`.
- **Ghost (Copiar / Reset)**: Sin fondo ni borde estático; relleno `#172033` al interactuar.

### Indicadores de Gamificación (XP & Rachas)
- **Cápsula de Racha (*Streak Pill*)**: Fondo `#172033` con borde sutil `#1E293B`. Icono de llama con acento `#F59E0B`. Texto numérico en `JetBrains Mono` resaltado.
- **Barra de XP Flotante**: Contenedor delgado de 6px de alto sobre fondo `#111827`, relleno fluido con gradiente `#6366F1` a `#38BDF8`, reflejando puntos ganados por cada consulta completada sin pistas.
- **Developer Badges**: Etiquetas compactas (`label-sm`) que indican maestría (`INDEX SPECIALIST`, `QUERY ARCHITECT`). Borde coloreado a 1px con un fondo al 10% de opacidad del tono del badge (`#38BDF8` o `#22C55E`).

### Editor de Código y Consola
- **Marco de Edición**: Borde continuo de 1px `#1E293B` con numeración de líneas en `#94A3B8` al 40% de opacidad. La línea activa recibe un resaltado de fondo plano `#172033` con 50% de opacidad.
- **Tablas de Datos de Salida (*Data Grid*)**: Cabeceras fijas en `#111827` con etiquetas de tipo (`INT`, `VARCHAR`) en `JetBrains Mono sm` color `#38BDF8`. Celdas con espaciado vertical de 8px y borde inferior `#1E293B`. Valores nulos identificados visualmente con un chip tenue en cursiva (`NULL`).

### Chips y Filtros
- **Píldoras de Filtro de Consulta**: Fondo `#111827`, borde `#1E293B`, texto `#94A3B8`. Estado activo con fondo `#172033`, texto `#38BDF8` y punto indicador luminiscente de 4px.

### Entradas de Datos (Inputs)
- **Campos de Búsqueda y Parámetros**: Fondo `#0B1020`, borde `#1E293B`, tipografía `Inter 14px` con placeholders en `#94A3B8`. Estado enfocado (*focus*) con borde `#6366F1` y resplandor perimetral sin deformación de layout.

### Casillas de Verificación y Selección (Checkboxes)
- Contenedores de 16x16px con radio de 4px sobre fondo `#111827`, borde `#1E293B`. Estado activo marcado en `#6366F1` con icono de check en `#F8FAFC`.