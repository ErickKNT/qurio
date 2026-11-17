# Qurio — Especificación Pedagógica Formal & Framework de Auditoría Curricular

> **Documento Normativo de Ingeniería Instruccional**  
> **Versión:** 1.0.0  
> **Ámbito:** Auditoría y Calibración Curricular (60 Retos de Aprendizaje SQL)  
> **Motor de Evaluación:** PostgreSQL 16 sobre Docker (`ecommerce_sandbox`)  
> **Público Objetivo del Documento:** Agentes de Inteligencia Artificial (Auditor/Diseñador Instruccional), Ingenieros Curriculares y Evaluadores Docentes.

---

## 1. Fundamentación Epistemológica y Literatura Científica

El diseño curricular y evaluativo de Qurio no se basa en heurísticas empíricas informales ni en generación estocástica desregulada. Cada directiva pedagógica, limitación cognitiva y estructura de andamiaje se sustenta en la literatura de **Computing Education Research (CER)**, **Psicología Cognitiva del Aprendizaje** y **Didáctica Especializada en Sistemas de Gestión de Bases de Datos Relacionales (RDBMS)**.

Todo agente o revisor humano debe calibrar el contenido contra los siguientes textos académicos formales y recursos abiertos:

### 1.1. Didáctica de SQL y Análisis Empírico de Errores Semánticos
* **Brass, S., & Goldberg, C. (2006).** *Semantic errors in SQL queries: A quite complete list*. **Journal of Systems and Software**, 79(5), 630–644.
  * **DOI / Enlace Académico:** [https://doi.org/10.1016/j.jss.2005.06.028](https://doi.org/10.1016/j.jss.2005.06.028)
  * **Página Académica del Autor (Martin-Luther-Universität Halle-Wittenberg):** [https://users.informatik.uni-halle.de/~brass/](https://users.informatik.uni-halle.de/~brass/)
  * **Fundamento Aplicado:** Establece la taxonomía canónica de anomalías y errores semánticos en SQL. Define las condiciones donde una consulta es sintácticamente válida (compila en el motor) pero lógicamente incorrecta (tautologías/contradicciones en `WHERE`, productos cartesianos encubiertos, colapsos inválidos de tuplas o proyecciones redundantes).
* **Taipalus, T., & Seppänen, V. (2020).** *SQL Education: A Systematic Mapping Study and Future Research Agenda*. **ACM Transactions on Computing Education (TOCE)**, 20(3), 1–33.
  * **DOI / Enlace Académico:** [https://doi.org/10.1145/3398377](https://doi.org/10.1145/3398377)
  * **Preprint Abierto Institucional (Universidad de Jyväskylä):** [https://jyx.jyu.fi/handle/123456789/71408](https://jyx.jyu.fi/handle/123456789/71408)
  * **Fundamento Aplicado:** Estudio sistemático sobre pedagogía de SQL. Documenta las dificultades asociadas a la introducción prematura de conceptos anidados y la necesidad de aislar factores de complejidad.
* **Taipalus, T. (2020).** *The effects of database complexity on SQL query formulation*. **Journal of Systems and Software**, 165, 110576.
  * **DOI / Enlace Académico:** [https://doi.org/10.1016/j.jss.2020.110576](https://doi.org/10.1016/j.jss.2020.110576)
  * **Fundamento Aplicado:** Análisis empírico del coste cognitivo derivado de la complejidad estructural de la base de datos y la formulación de consultas multi-cláusula en alumnos novatos e intermedios.
* **Ahadi, A., Behbood, V., Vihavainen, A., Prior, J., & Lister, R. (2016).** *Students' Syntactic Mistakes in Writing Seven Different Types of SQL Queries and its Application to Predicting Students' Success*. **Proceedings of the 47th ACM Technical Symposium on Computing Science Education (SIGCSE '16)**, 401–406.
  * **DOI / Enlace Académico:** [https://doi.org/10.1145/2839509.2844640](https://doi.org/10.1145/2839509.2844640)
  * **Fundamento Aplicado:** Evaluación cuantitativa de consultas estudiantiles reales en siete familias de SQL, identificando los errores persistentes que requieren progresión gradual.
* **Mitrovic, A. (2003).** *An Intelligent SQL Tutor on the Web*. **International Journal of Artificial Intelligence in Education**, 13(2–4), 173–197; y **Mitrovic, A., Martin, B., & Suraweera, P. (2007).** *Intelligent Tutors for All: The Constraint-Based Approach*. **IEEE Intelligent Systems**, 22(4), 38–45.
  * **DOI / Enlace Académico (2003):** [https://doi.org/10.3233/irg-2003-13(2-4)03](https://doi.org/10.3233/irg-2003-13(2-4)03)
  * **DOI / Enlace Académico (2007):** [https://doi.org/10.1109/MIS.2007.74](https://doi.org/10.1109/MIS.2007.74)
  * **Fundamento Aplicado:** Demostración del modelo basado en restricciones relacionales (*Constraint-Based Modeling*): el aprendizaje se maximiza cuando el sistema verifica el cumplimiento de propiedades del conjunto resultante en lugar de comparar cadenas de texto o regex.

### 1.2. Pedagogía Técnica de la Computación y Educación Abierta
* **Wilson, G. (2019).** *Teaching Tech Together: How to Create and Deliver Great Lessons and Workshops That Work*. CRC Press / Taylor & Francis.
  * **Lectura Gratuita Abierta (Creative Commons):** [https://teachtogether.tech/](https://teachtogether.tech/)
  * **Repositorio de Código Fuente en Markdown:** [https://github.com/gvwilson/teachtogether.tech](https://github.com/gvwilson/teachtogether.tech)
  * **Fundamento Aplicado:** Metodología central de andamiaje (*faded scaffolding*), diseño de preguntas diagnósticas (*formative assessments*) de 3 minutos y eliminación de sobrecarga en explicaciones técnicas.
* **The Carpentries (2024).** *Instructor Training Curriculum*.
  * **Currículo Abierto en Línea:** [https://carpentries.github.io/instructor-training/](https://carpentries.github.io/instructor-training/)
  * **Fundamento Aplicado:** Procedimientos sistemáticos para la detección y corrección de conceptos erróneos (*misconceptions*) en el aprendizaje técnico de adultos.

### 1.3. Psicología Cognitiva del Aprendizaje
* **Sweller, J. (1988).** *Cognitive load during problem solving: Effects on learning*. **Cognitive Science**, 12(2), 257–285.
  * **DOI / Enlace Académico:** [https://doi.org/10.1207/s15516709cog1202_4](https://doi.org/10.1207/s15516709cog1202_4)
* **Sweller, J., Ayres, P., & Kalyuga, S. (2011).** *Cognitive Load Theory*. Springer.
  * **Enlace Editorial:** [https://link.springer.com/book/10.1007/978-1-4419-8126-4](https://link.springer.com/book/10.1007/978-1-4419-8126-4)
  * **Fundamento Aplicado:** Teoría de la Carga Cognitiva (CLT). La memoria de trabajo está limitada a procesar pocos elementos nuevos simultáneos. Se debe eliminar la **carga extraña** (enunciados ambiguos, nombres rebuscados) para concentrar los recursos en la **carga pertinente** (asimilación del modelo relacional).
* **Renkl, A. (2014).** *Toward an instructionally oriented theory of example-based learning*. **Cognitive Science**, 38(1), 1–37.
  * **DOI / Enlace Académico:** [https://doi.org/10.1111/cogs.12086](https://doi.org/10.1111/cogs.12086)
  * **Fundamento Aplicado:** Efecto del Ejemplo Resuelto (*Worked Example Effect*). Los estudiantes asimilan mejor la lógica cuando observan estructuras resueltas y avanzan hacia problemas de compleción antes de enfrentarse a un lienzo en blanco.

### 1.4. Alineamiento Curricular e Instruccional
* **Wiggins, G., & McTighe, J. (2005).** *Understanding by Design* (2nd ed.). ASCD.
  * **Referencia:** ISBN: 978-1-4166-0035-0.
  * **Fundamento Aplicado:** Diseño Inverso (*Backward Design*). Cada reto se formula definiendo primero el resultado observable y la evidencia objetiva en el dataset de prueba, redactando la consigna únicamente como último paso.
* **Biggs, J., & Tang, C. (2011).** *Teaching for Quality Learning at University* (4th ed.). McGraw-Hill Education / Open University Press.
  * **Fundamento Aplicado:** Alineamiento Constructivo. Coherencia estricta entre el nivel cognitivo de la taxonomía de Bloom, la consigna de negocio y la rigurosidad de las pistas.

---

## 2. Taxonomía Operativa de Errores Semánticos (Misconceptions)

El agente auditor debe verificar que cada ejercicio del plan curricular enfrente al estudiante de forma calculada con al menos una de las trampas relacionales documentadas en la literatura (Brass & Goldberg, 2006; Taipalus, 2020):

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│               TAXONOMÍA DE ERRORES CONCEPTUALES Y SEMÁNTICOS                    │
├───────────────────────────────┬─────────────────────────────────────────────────┤
│ Categoría de Error            │ Manifestación Práctica en Código SQL            │
├───────────────────────────────┼─────────────────────────────────────────────────┤
│ 1. Inconsistencias Lógicas    │ • Condiciones contradictorias (WHERE x AND NOT x│
│                               │ • Tautologías innecesarias (WHERE 1=1).         │
│                               │ • Comparaciones de igualdad con NULL (= NULL).  │
├───────────────────────────────┼─────────────────────────────────────────────────┤
│ 2. Distorsión de Cardinalidad │ • Pérdida de entidades por usar INNER JOIN      │
│    (Joins y Multiplicación)   │   en vez de LEFT JOIN para auditar huérfanos.   │
│                               │ • Multiplicación exponencial involuntaria por   │
│                               │   unir tablas con relaciones 1:N sin agregar.   │
│                               │ • Filtro en WHERE sobre tabla opcional que      │
│                               │   degrada implícitamente el LEFT JOIN a INNER.  │
├───────────────────────────────┼─────────────────────────────────────────────────┤
│ 3. Agrupación y Reducción     │ • Omitir columnas no agregadas en GROUP BY      │
│    (GROUP BY / HAVING)        │   (violación de colapso de tuplas).             │
│                               │ • Filtrar agregados dentro de WHERE.            │
│                               │ • Uso de DISTINCT como parche para mitigar un   │
│                               │   JOIN erróneo que produjo duplicados.          │
├───────────────────────────────┼─────────────────────────────────────────────────┤
│ 4. Lógica Trivalente (3VL)    │ • No considerar registros con NULL en NOT IN.   │
│    y Agregaciones             │ • Disparidad entre COUNT(*) y COUNT(columna).   │
│                               │ • Incompatibilidad de tipos en comparaciones.   │
├───────────────────────────────┼─────────────────────────────────────────────────┤
│ 5. Orden de Evaluación        │ • Referenciar alias de SELECT dentro de WHERE   │
│    Mental vs. Sintaxis Léxica │   o GROUP BY.                                   │
│                               │ • Uso de LIMIT sin un ORDER BY determinista con │
│                               │   criterio de desempate explícito.              │
└───────────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 3. Protocolo Estricto Anti-Alucinación

Para evitar la generación de pseudocódigo no probado o instrucciones que no compilan en PostgreSQL 16, el agente debe regirse obligatoriamente por las siguientes **cinco restricciones duras**:

### Regla 1: Paridad Absoluta con PostgreSQL 16
* Todo código generado o auditado debe ser 100% compatible con el motor **PostgreSQL 16**.
* Queda terminantemente prohibido utilizar sintaxis de dialectos ajenos (MySQL, SQL Server, SQLite, Oracle) o funciones hipotéticas.
* Toda solución oficial (`solution_query`) debe ser físicamente ejecutable en el sandbox bajo el rol `readonly_student` y respetar `statement_timeout = 2000ms`.

### Regla 2: Esquema Canónico Cerrado (`Ecommerce_Production_DB` / `ecommerce_sandbox`)
El agente no debe inventar tablas ni columnas. Toda consulta debe operar exclusivamente sobre las 10 tablas formales definidas en `database/sandbox/ecommerce_seed.sql`:

1. **`clientes`** (`cliente_id`, `nombre`, `apellido`, `email`, `ciudad`, `pais`, `fecha_registro`)
2. **`categorias`** (`categoria_id`, `nombre_categoria`, `descripcion`)
3. **`proveedores`** (`proveedor_id`, `nombre_proveedor`, `pais`, `telefono`)
4. **`productos`** (`producto_id`, `categoria_id`, `proveedor_id`, `nombre_producto`, `precio`, `stock`)
5. **`pedidos`** (`pedido_id`, `cliente_id`, `fecha_pedido`, `estado_pedido`, `total`)
6. **`detalle_pedidos`** (`detalle_id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario`)
7. **`facturas`** (`factura_id`, `pedido_id`, `fecha_emision`, `monto_total`, `estado_factura`)
8. **`pagos`** (`pago_id`, `factura_id`, `metodo_pago`, `monto`, `fecha_pago`, `estado_pago`)
9. **`almacenes`** (`almacen_id`, `nombre_almacen`, `ciudad`, `capacidad_m2`)
10. **`inventario`** (`almacen_id`, `producto_id`, `cantidad_disponible`, `ultima_actualizacion`) *(clave primaria compuesta)*

### Regla 3: Cardinalidad Comprobada (No-Empty Sets)
* La `solution_query` **jamás debe retornar un conjunto vacío (0 filas)**. Un resultado vacío impide al evaluador semántico contrastar cardinalidad y estructura de columnas con certeza.
* La cardinalidad devuelta por la consulta oficial debe situarse idealmente entre **1 y 20 filas**.

### Regla 4: Determinismo en Ordenamiento y Límites
* Si un ejercicio solicita los registros más altos, más bajos o utiliza `LIMIT`, es **obligatorio** exigir `ORDER BY` con una columna secundaria de desempate única (ej. `ORDER BY total DESC, id ASC`). Sin esto, el motor de PostgreSQL escanea en orden físico de páginas y puede generar veredictos erróneos por no determinismo.

### Regla 5: Blindaje Anti-Spoilers en Micro-Teoría
* El bloque *"Concepto Clave & Sintaxis"* **tiene prohibido nombrar las tablas o columnas del reto en cuestión**.
* Debe utilizar exclusivamente metavariables abstractas en minúsculas:
  ```sql
  SELECT columna_agrupada, FUNCION_AGREGADA(columna_calculada)
  FROM nombre_tabla
  WHERE condicion_previa
  GROUP BY columna_agrupada
  HAVING FUNCION_AGREGADA(columna_calculada) > umbral_valor;
  ```

### Regla 6: Español 100% Progresivo y Carga Cognitiva Controlada
* Toda la plataforma (rutas formativas, módulos, títulos de retos, consignas, pistas y etiquetas de interfaz) debe redactarse en **español claro, natural y progresivo**, acompañando al estudiante desde lo más básico hasta niveles analíticos avanzados.
* Se conservan únicamente las palabras reservadas y conceptos propios del lenguaje SQL (`SELECT`, `WHERE`, `JOIN`, `GROUP BY`, `HAVING`, `ORDER BY`, `LIMIT`, `NULL`, `WITH`/`CTE`, `ROW_NUMBER`, `PostgreSQL`, etc.), eliminando anglicismos innecesarios (*Foundations*, *Syllabus*, *Pipeline*, *Ticket*, *Anti-Join* sin explicación) o jerga de infraestructura ajena al aprendiz.

---

## 4. Arquitectura de Andamiaje Decreciente (*3-Tier Scaffolding*)

Cada ejercicio curricular se estructura en tres niveles pedagógicos decrecientes (Renkl, 2014; Wilson, 2019):

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA 1: CONCEPTO CLAVE & SINTAXIS                    │
│   • Plantilla sintáctica abstracta con metavariables.                  │
│   • Explica el flujo de datos según el orden de procesamiento mental   │
│     de PostgreSQL (FROM → WHERE → GROUP BY → HAVING → SELECT).         │
│   • Cero mención a nombres de entidades del reto (Cero Spoilers).      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA 2: ANDAMIAJE DE PISTAS (3 NIVELES)              │
│   • Pista 1 (Conceptual, -15% XP): Lógica relacional sin código SQL.   │
│   • Pista 2 (Sintáctica, -30% XP): Cláusulas exactas requeridas.       │
│   • Pista 3 (Estructural, -45% XP): Esqueleto con marcadores (???).    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA 3: DESAFÍO AUTÉNTICO EN NEGOCIO                 │
│   • Consigna situada en operaciones de comercio electrónico.           │
│   • Proyección limpia y explícita sin recurrir a SELECT *.             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Rúbrica de Auditoría Curricular (Escala 1 al 5)

Para dar por certificado un ejercicio, el agente auditor debe evaluar las siguientes 6 dimensiones. El puntaje ponderado mínimo de aprobación es **4.5 / 5.0**:

| Dimensión | Ponderación | Criterio de Aprobación (5 Puntos) | Causa de Rechazo Inmediato (1 Punto) |
| :--- | :---: | :--- | :--- |
| **1. Átomo Cognitivo** | 20% | Evalúa estrictamente un solo concepto relacional nuevo a la vez. Dificultad adecuada a la ruta. | Mezcla múltiples conceptos no explicados previamente (ej. CTEs anidadas en Foundations). |
| **2. Determinismo** | 20% | Incluye columnas de desempate en `ORDER BY` ante cualquier uso de ordenamiento o `LIMIT`. | Orden ambiguo que provoca discrepancias intermitentes en el evaluador semántico. |
| **3. Anti-Spoilers** | 20% | Sintaxis completamente abstracta (`tabla_a`, `columna_1`). Cero nombres del reto. | Muestra la solución oficial cambiando únicamente un valor escalar o numérico. |
| **4. Andamiaje de Pistas** | 15% | Pistas 1, 2 y 3 respetan la jerarquía: Conceptual $\to$ Cláusulas $\to$ Esqueleto con placeholders. | Pistas triviales ("revisa la sintaxis") o que proporcionan la consulta final resuelta. |
| **5. Autenticidad** | 15% | Problema formulado con lógica de negocio realista sobre el comercio electrónico. | Consigna artificial desprovista de contexto (ej. "Muestra col1 de tab1 donde col2 sea 5"). |
| **6. No-Empty Result** | 10% | La solución oficial devuelve entre 1 y 20 filas en PostgreSQL 16 verificado. | La consulta oficial retorna 0 registros o genera timeout en el sandbox. |

---

## 6. Directiva de Operación para el Agente (System Prompt Maestro)

El siguiente bloque de texto contiene las instrucciones imperativas que deben inyectarse en el agente de inteligencia artificial para ejecutar la auditoría de los retos:

```text
ROL Y CONTEXTO OPERATIVO:
Actúas como el Auditor Pedagógico Principal de Qurio, una plataforma de alta fidelidad técnica para aprendizaje de SQL en PostgreSQL 16. Tu misión es auditar, detectar inconsistencias didácticas y refactorizar los 60 ejercicios curriculares basándote rigurosamente en docs/pedagogia/qurio_pedagogical_specification_ai_agent_framework.md.

DIRECTIVAS DETERMINISTAS:
1. PARIDAD ESTRICTA CON POSTGRESQL 16: Toda consulta debe compilar y ejecutarse sin errores en PostgreSQL 16 contra el esquema canónico de 10 tablas de ecommerce_sandbox (database/sandbox/ecommerce_seed.sql). No inventes tablas, campos, funciones o dialectos ajenos.
2. CERO ALUCINACIONES PEDAGÓGICAS: Toda crítica instruccional debe basarse en la literatura formal citada en la especificación (Brass & Goldberg, Taipalus, Wilson, Sweller, Renkl). Prohibido emitir juicios de valor subjetivos sin anclaje en la teoría del aprendizaje relacional.
3. PROTOCOLO ANTI-SPOILERS: Comprueba que el bloque "Concepto Clave & Sintaxis" utilice únicamente metavariables abstractas (columna_1, tabla_origen). Si contiene nombres reales de las tablas o columnas del ejercicio, repruébalo con 0/5 en esa dimensión y redacta la versión abstracta.
4. CONTROL DE DETERMINISMO: Si la consigna exige ordenamiento o límite de filas, verifica que la solución oficial y las pistas exijan desempate determinista en ORDER BY.
5. CARDINALIDAD COMPROBADA: La solución oficial nunca puede retornar 0 filas. Debe arrojar entre 1 y 20 registros con datos representativos.
6. ESPAÑOL 100% PROGRESIVO: Redacta títulos de rutas, módulos, retos, pistas y explicaciones en español claro y progresivo, reservando el inglés exclusivamente para palabras reservadas o conceptos propios de SQL.

FORMATO DE SALIDA REQUERIDO (Markdown):
Para cada ejercicio auditado, genera tu reporte con la siguiente estructura:

### 📋 Auditoría: Reto [ID] — [Título]
- **Ruta / Módulo:** [Ruta 1/2/3] • [Módulo X]
- **Concepto Relacional Evaluado:** [Nombre técnico]
- **Nivel de Bloom:** [Recordar | Comprender | Aplicar | Analizar | Evaluar]
- **Error Semántico Abordado (Brass & Goldberg):** [Clasificación del error]
- **Evaluación de Rúbrica (Score Final: X.X / 5.0):**
  * Átomo Cognitivo: [1-5] (20%)
  * Determinismo: [1-5] (20%)
  * Anti-Spoilers: [1-5] (20%)
  * Andamiaje de Pistas: [1-5] (15%)
  * Autenticidad: [1-5] (15%)
  * No-Empty Result: [1-5] (10%)

#### 🔍 Diagnóstico Crítico
- **Fortalezas:** [Análisis objetivo]
- **Deficiencias Didácticas o Técnicas:** [Identificación de fallas según la rúbrica]

#### 🛠️ Propuesta de Refactorización (Obligatoria si Score < 4.5)
- **Consigna Mejorada:** [Enunciado de negocio claro y no ambiguo]
- **Concepto Clave & Sintaxis (Saneado):**
  ```sql
  -- Plantilla puramente abstracta
  ```
- **Pistas Calibradas:**
  * *Pista 1 (Conceptual):* [Lógica relacional sin sintaxis SQL]
  * *Pista 2 (Sintaxis):* [Cláusulas exactas requeridas]
  * *Pista 3 (Esqueleto):* [Consulta con placeholders ???]
- **Solución Oficial Canónica (`solution_query`):**
  ```sql
  -- Consulta validada que compila contra Ecommerce_Production_DB
  ```
```