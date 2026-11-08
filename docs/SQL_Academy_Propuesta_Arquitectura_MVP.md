# SQL Academy --- Propuesta de producto y arquitectura del MVP

**Versión:** 1.0\
**Fecha:** noviembre de 2026\
**Estado:** propuesta inicial para definición y desarrollo

------------------------------------------------------------------------

## 1. Visión del producto

SQL Academy será una plataforma pública de aprendizaje práctico de SQL.
Combinará la facilidad de uso y la progresión gamificada de aplicaciones
como Duolingo con la profundidad técnica de un laboratorio profesional
de bases de datos.

### Decisiones iniciales

-   **Público:** cualquier persona que quiera aprender SQL, desde
    principiantes hasta desarrolladores y analistas.
-   **Motor SQL inicial:** PostgreSQL.
-   **Experiencia:** combinación de aprendizaje gamificado y
    capacitación profesional.
-   **Objetivo:** enseñar SQL mediante ejercicios ejecutables,
    escenarios empresariales y retos progresivos.

### Propuesta de valor

> Aprende SQL practicando directamente sobre bases de datos de
> entrenamiento, resolviendo desafíos progresivos y desarrollando
> habilidades que puedas aplicar en el mundo laboral.

La plataforma tendrá dos experiencias principales:

1.  **Learning Path:** aprendizaje guiado, lecciones, progreso, puntos,
    logros y niveles.
2.  **SQL Playground:** laboratorio libre para experimentar con
    consultas, tablas, relaciones e índices.

------------------------------------------------------------------------

## 2. Arquitectura funcional

La plataforma se organizará en ocho módulos:

  -----------------------------------------------------------------------
  Módulo                              Responsabilidad
  ----------------------------------- -----------------------------------
  Dashboard                           Resumen del aprendizaje, actividad
                                      reciente, objetivos diarios, XP y
                                      recomendaciones.

  Learning Paths                      Rutas de aprendizaje organizadas
                                      por niveles, módulos, lecciones y
                                      prerrequisitos.

  SQL Playground                      Editor SQL, explorador de tablas,
                                      ejecución de consultas y
                                      visualización de resultados.

  Challenges                          Problemas prácticos con validación
                                      automática, pistas y niveles de
                                      dificultad.

  Database Labs                       Laboratorios para crear tablas,
                                      insertar datos, modificar
                                      estructuras y trabajar con índices.

  Achievements                        XP, niveles, insignias, rachas y
                                      clasificaciones opcionales.

  Projects                            Proyectos empresariales
                                      integradores que evalúan múltiples
                                      conocimientos.

  Profile                             Perfil, estadísticas, historial de
                                      ejercicios y configuración.
  -----------------------------------------------------------------------

### Modalidades de aprendizaje

#### A. Editor SQL interactivo

El estudiante recibe un problema y escribe su propia consulta SQL. La
plataforma ejecuta la consulta y evalúa el resultado.

Ejemplo de reto:

> Obtén los nombres de los empleados que pertenecen al departamento de
> Sistemas y cuyo salario sea superior a \$15,000.

``` sql
SELECT
    nombre,
    salario
FROM empleados
WHERE departamento = 'Sistemas'
  AND salario > 15000;
```

#### B. Retos de resolución de problemas

Los ejercicios plantearán situaciones empresariales, por ejemplo:

-   Encontrar clientes que nunca han realizado compras.
-   Identificar facturas duplicadas.
-   Encontrar el último pago de cada beneficiario.
-   Consolidar números telefónicos.
-   Detectar registros sin correspondencia entre dos tablas.

#### C. Laboratorio de bases de datos

El estudiante podrá experimentar con:

-   Crear tablas.
-   Insertar registros.
-   Modificar estructuras.
-   Crear y eliminar índices.
-   Ejecutar procedimientos almacenados.
-   Consultar planes de ejecución.

#### D. Desafíos de optimización

Se presentarán consultas correctas pero ineficientes. El estudiante
deberá mejorarlas y explicar los cambios.

Se podrán evaluar:

-   Tiempo de ejecución.
-   Lecturas lógicas.
-   Uso de índices.
-   Cantidad de operaciones.
-   Plan de ejecución.

#### E. Proyectos prácticos

Al terminar una ruta, el estudiante recibirá una base de datos y
requerimientos de negocio. Tendrá que generar reportes, detectar
inconsistencias y responder preguntas mediante SQL.

------------------------------------------------------------------------

## 3. Rutas de aprendizaje

La academia tendrá seis rutas progresivas.

  -----------------------------------------------------------------------
  Ruta                    Temas                   Nivel
  ----------------------- ----------------------- -----------------------
  1\. SQL Foundations     SELECT, FROM, WHERE,    Principiante
                          ORDER BY, DISTINCT,     
                          operadores, LIKE, IN,   
                          BETWEEN y agregaciones. 

  2\. Relational SQL      INNER, LEFT, RIGHT,     Principiante
                          FULL OUTER, CROSS y     
                          SELF JOIN; UNION, UNION 
                          ALL y relaciones.       

  3\. Advanced Queries    Subconsultas, CTE,      Intermedio
                          CASE, funciones de      
                          ventana, ROW_NUMBER,    
                          RANK, DENSE_RANK,       
                          PIVOT/UNPIVOT cuando    
                          corresponda.            

  4\. Database            DDL, DML, claves,       Intermedio
  Engineering             constraints, índices,   
                          vistas y procedimientos 
                          almacenados.            

  5\. Query Optimization  EXPLAIN, EXPLAIN        Avanzado
                          ANALYZE, Index          
                          Scan/Seek               
                          conceptualmente,        
                          índices compuestos,     
                          estadísticas,           
                          SARGability y           
                          optimización de JOIN.   

  6\. Professional SQL    Transacciones,          Avanzado
                          bloqueos, deadlocks,    
                          niveles de aislamiento, 
                          triggers, ETL,          
                          auditoría, seguridad y  
                          permisos.               
  -----------------------------------------------------------------------

**Alcance académico del MVP:** completar las primeras tres rutas y
ofrecer una selección de ejercicios de la cuarta. Las rutas avanzadas se
ampliarán después del lanzamiento inicial.

### Escenarios empresariales

Los ejercicios utilizarán conjuntos de datos realistas:

1.  **Comercio e inventarios:** productos, proveedores, compras, ventas
    y almacenes.
2.  **Recursos humanos:** empleados, departamentos, nóminas y
    asistencias.
3.  **Finanzas:** cuentas, movimientos, pagos y facturas.
4.  **Logística:** envíos, transportistas, pedidos y rutas.

La base de datos de comercio puede comenzar con estas tablas:

``` text
COMERCIO
├── Clientes
├── Productos
├── Categorias
├── Proveedores
├── Almacenes
├── Inventario
├── Pedidos
├── DetallePedidos
├── Facturas
└── Pagos
```

Los conjuntos de datos deben tener suficiente volumen y variedad para
que los ejercicios de JOIN, agregación y optimización sean
significativos.

------------------------------------------------------------------------

## 4. Arquitectura técnica

### Enfoque arquitectónico

Se propone un **monolito modular** para la aplicación principal y un
**servicio independiente de ejecución SQL**.

No se recomienda comenzar con microservicios: añadirían complejidad
operativa innecesaria para el MVP. Sí se separarán las responsabilidades
y los límites de seguridad desde el inicio.

### Stack tecnológico

  -----------------------------------------------------------------------
  Capa                    Tecnología              Responsabilidad
  ----------------------- ----------------------- -----------------------
  Frontend                React + TypeScript      Interfaz de usuario

  Estilos                 Tailwind CSS            Sistema visual

  Arquitectura UI         Atomic Design           Organización de
                                                  componentes

  Editor SQL              Monaco Editor           Escritura y edición de
                                                  consultas

  Backend                 Python + FastAPI        API y lógica de negocio

  ORM                     SQLAlchemy              Persistencia y acceso a
                                                  datos

  Migraciones             Alembic                 Evolución del esquema

  Base principal          PostgreSQL              Usuarios, cursos y
                                                  progreso

  Motor de ejercicios     PostgreSQL aislado      Ejecución de ejercicios
                                                  y laboratorios

  Infraestructura         Docker                  Contenedores y
                                                  aislamiento

  Testing                 Pytest + Vitest         Pruebas backend y
                                                  frontend

  CI/CD                   GitHub Actions          Integración y
                                                  despliegue
  -----------------------------------------------------------------------

### Separación de bases de datos

La arquitectura debe separar claramente dos entornos PostgreSQL.

#### A. Application Database

Base de datos interna de SQL Academy:

-   Usuarios y perfiles.
-   Cursos, rutas, módulos y ejercicios.
-   XP, logros y progreso.
-   Historial de intentos.
-   Configuración de la plataforma.

#### B. SQL Execution Engine

Entorno independiente y aislado para ejecutar consultas de estudiantes:

-   Bases de datos de entrenamiento.
-   Ejecución de consultas.
-   Creación de tablas e índices.
-   Validación de ejercicios.
-   Reinicio de laboratorios.

**Regla de seguridad:** los entornos de ejecución no deben compartir
credenciales, permisos ni acceso de red directo con la base principal de
la aplicación.

Para ejercicios de lectura se utilizarán permisos limitados. Para
laboratorios de DDL y administración, cada sesión tendrá una base de
datos temporal propia.

### Arquitectura lógica

``` mermaid
flowchart TB
    U["Usuario"]
    FE["React + TypeScript"]
    API["FastAPI - Modular Monolith"]

    subgraph APP["Application Layer"]
      AUTH["Authentication"]
      LEARN["Learning Management"]
      PROG["Progress & Gamification"]
      CHALL["Challenge Evaluator"]
      LAB["Lab Management"]
    end

    DB[("Application PostgreSQL")]
    QUEUE["Execution Queue"]
    RUN["SQL Execution Service"]
    SANDBOX[("Isolated PostgreSQL Labs")]

    U --> FE
    FE --> API
    API --> AUTH
    API --> LEARN
    API --> PROG
    API --> CHALL
    API --> LAB
    AUTH --> DB
    LEARN --> DB
    PROG --> DB
    CHALL --> DB
    LAB --> DB
    CHALL --> QUEUE
    LAB --> QUEUE
    QUEUE --> RUN
    RUN --> SANDBOX
    RUN --> API
```

Para el MVP, la cola puede implementarse con una solución ligera y el
servicio de ejecución como un proceso worker independiente. No es
necesario incorporar Kafka ni infraestructura distribuida.

------------------------------------------------------------------------

## 5. Diseño de la base de datos principal

La base de datos de SQL Academy será independiente de las bases de datos
que utilizan los estudiantes para practicar.

### Entidades principales

``` mermaid
erDiagram
    USERS ||--o| USER_PROFILES : has
    USERS ||--o{ USER_PROGRESS : tracks
    USERS ||--o{ EXERCISE_ATTEMPTS : makes
    USERS ||--o{ USER_ACHIEVEMENTS : earns
    LEARNING_PATHS ||--o{ MODULES : contains
    MODULES ||--o{ LESSONS : contains
    LESSONS ||--o{ EXERCISES : contains
    EXERCISES ||--o{ EXERCISE_ATTEMPTS : receives
    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : awarded
    USERS ||--o{ LAB_SESSIONS : creates
    MODULES ||--o{ USER_PROGRESS : tracks
```

### Tablas propuestas

  Tabla                 Propósito
  --------------------- ------------------------------------------
  users                 Cuentas y autenticación
  user_profiles         Datos del perfil
  learning_paths        Rutas de aprendizaje
  modules               Módulos de cada ruta
  lessons               Contenido educativo
  exercises             Enunciados y configuración de ejercicios
  exercise_test_cases   Casos de evaluación de ejercicios
  exercise_hints        Pistas progresivas
  exercise_attempts     Intentos y resultados
  user_progress         Avance del estudiante
  achievements          Catálogo de logros
  user_achievements     Logros desbloqueados
  lab_sessions          Sesiones de laboratorio
  daily_activity        Actividad y rachas

El contenido de los ejercicios debe ser administrable y versionable, no
estar incrustado en componentes React ni disperso en código Python.

------------------------------------------------------------------------

## 6. Motor de evaluación SQL

El motor de evaluación es uno de los componentes centrales del producto.
No debe limitarse a comprobar si la consulta se ejecuta sin errores.

### Flujo de evaluación

``` mermaid
flowchart TD
    A["Estudiante envía SQL"]
    B["Validar sesión y ejercicio"]
    C["Validar límites y permisos"]
    D["Ejecutar en entorno aislado"]
    E["Obtener resultado"]
    F["Comparar contra resultado esperado"]
    G{"¿Resultado correcto?"}
    H["Registrar intento y otorgar XP"]
    I["Registrar error y proporcionar pistas"]

    A --> B --> C --> D --> E --> F --> G
    G -->|Sí| H
    G -->|No| I
```

### Ejemplo de equivalencia semántica

Ejercicio: encontrar todos los clientes que nunca han realizado una
compra.

Primera solución:

``` sql
SELECT c.*
FROM customers c
LEFT JOIN orders o
    ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;
```

Segunda solución:

``` sql
SELECT *
FROM customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

Ambas consultas pueden considerarse correctas si producen el mismo
resultado esperado.

### Criterios de evaluación

-   Comparación de columnas y tipos.
-   Comparación de registros.
-   Manejo de valores NULL.
-   Consideración del orden cuando el ejercicio lo requiera.
-   Casos de prueba con datos adicionales.
-   Manejo de resultados vacíos.
-   Control de duplicados.
-   Distinción entre errores de sintaxis y respuestas incorrectas.

La evaluación debe considerar resultados y comportamiento, no depender
exclusivamente de comparar el texto SQL enviado por el estudiante.

------------------------------------------------------------------------

## 7. Seguridad del motor de ejecución

El SQL enviado por los estudiantes debe tratarse como entrada no
confiable.

Controles mínimos:

-   Tiempo máximo de ejecución.
-   Límites de memoria y recursos.
-   Límites de conexiones.
-   Restricciones de permisos.
-   Entornos aislados y desechables.
-   Reinicio de sesiones.
-   Auditoría de ejecuciones.
-   Límites de tamaño de resultados.
-   Cuotas de ejecución por usuario.
-   Separación de red y credenciales entre aplicación y laboratorios.

No se debe confiar únicamente en bloquear palabras como `DROP`, `DELETE`
o `UPDATE`. La seguridad debe basarse en aislamiento, permisos mínimos y
límites impuestos por el motor y la infraestructura.

Los laboratorios que permitan DDL o DML deben ejecutarse en bases
temporales controladas, nunca en la base principal ni en conjuntos de
datos compartidos de otros usuarios.

------------------------------------------------------------------------

## 8. Gamificación y experiencia profesional

La experiencia combinará motivación y medición real del aprendizaje.

### Sistema de aprendizaje

-   **XP:** puntos por resolver ejercicios, completar módulos y superar
    retos.
-   **Niveles:** progresión asociada a experiencia y dominio.
-   **Rachas:** actividad en días consecutivos.
-   **Logros:** insignias por hitos concretos.
-   **Progreso:** avance por ruta y módulo.
-   **Clasificaciones:** opcionales, sin convertirlas en requisito para
    aprender.

No se premiará repetir indefinidamente el mismo ejercicio.

### Sistema de capacitación

-   Nivel de dominio por concepto.
-   Evaluaciones finales.
-   Proyectos integradores.
-   Historial de resultados.
-   Retroalimentación técnica.
-   Certificados internos de finalización.

Los certificados iniciales acreditarán la finalización de rutas de
aprendizaje; no se presentarán como certificaciones profesionales
oficiales.

------------------------------------------------------------------------

## 9. Alcance del MVP

El MVP debe demostrar que una persona puede aprender y practicar SQL de
principio a fin.

### Incluido

  Funcionalidad       Alcance
  ------------------- -----------------------------------------------------
  Autenticación       Registro, inicio de sesión y recuperación de cuenta
  Dashboard           Resumen del progreso
  Cursos              Rutas, módulos y lecciones
  Ejercicios          50 retos SQL
  Editor              Monaco Editor
  Ejecución           PostgreSQL aislado
  Evaluación          Validación automática
  Retroalimentación   Errores, explicaciones y pistas
  Gamificación        XP, niveles y logros básicos
  Playground          Laboratorio con datos de entrenamiento
  Responsive          Escritorio, tablet y móvil

### Fuera del MVP

-   Cursos impartidos por profesores.
-   Chat con inteligencia artificial.
-   Competencias multijugador.
-   Editor colaborativo.
-   Suscripciones y pagos.
-   Aplicación móvil nativa.
-   Certificaciones oficiales.
-   Soporte para múltiples motores SQL.

La prioridad es que los ejercicios funcionen correctamente y que la
experiencia de aprendizaje sea consistente.

------------------------------------------------------------------------

## 10. Estructura del repositorio

Se propone un monorepo:

``` text
sql-academy/
│
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── atoms/
│   │   │   │   ├── molecules/
│   │   │   │   ├── organisms/
│   │   │   │   └── templates/
│   │   │   ├── features/
│   │   │   │   ├── authentication/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── learning/
│   │   │   │   ├── exercises/
│   │   │   │   ├── playground/
│   │   │   │   └── gamification/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── tests/
│   │
│   └── api/
│       ├── app/
│       │   ├── core/
│       │   ├── modules/
│       │   │   ├── users/
│       │   │   ├── authentication/
│       │   │   ├── courses/
│       │   │   ├── lessons/
│       │   │   ├── exercises/
│       │   │   ├── evaluation/
│       │   │   ├── progress/
│       │   │   └── gamification/
│       │   ├── infrastructure/
│       │   └── main.py
│       └── tests/
│
├── services/
│   └── sql-runner/
│       ├── execution/
│       ├── sandbox/
│       ├── evaluator/
│       └── tests/
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── exercises/
│
├── infrastructure/
│   ├── docker/
│   └── compose/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── security/
│
└── README.md
```

Cada módulo del backend debe organizar sus modelos, esquemas, servicios
y repositorios. Se evitarán archivos gigantes y dependencias circulares.

------------------------------------------------------------------------

## 11. API inicial

Los endpoints iniciales utilizarán el prefijo `/api/v1`.

  Método   Endpoint                          Función
  -------- --------------------------------- ----------------------------------
  POST     `/api/v1/auth/register`           Registro
  POST     `/api/v1/auth/login`              Inicio de sesión
  GET      `/api/v1/users/me`                Consultar perfil
  GET      `/api/v1/learning-paths`          Consultar rutas
  GET      `/api/v1/modules/{id}`            Consultar módulo
  GET      `/api/v1/exercises/{id}`          Obtener ejercicio
  POST     `/api/v1/exercises/{id}/submit`   Enviar respuesta
  GET      `/api/v1/progress/me`             Consultar progreso
  GET      `/api/v1/achievements`            Consultar logros
  POST     `/api/v1/labs`                    Crear laboratorio
  POST     `/api/v1/labs/{id}/execute`       Ejecutar SQL
  DELETE   `/api/v1/labs/{id}`               Reiniciar o eliminar laboratorio

Los endpoints de ejecución y evaluación tendrán responsabilidades
separadas, aunque compartan infraestructura.

------------------------------------------------------------------------

## 12. Diseño visual e identidad

### Dirección visual

Se propone una estética tecnológica, profesional y moderna:

-   Dark mode como experiencia principal para estudiar y programar.
-   Light mode como alternativa para lectura y estudio.
-   Sidebar para navegación.
-   Tarjetas de progreso.
-   Indicadores de nivel.
-   Editor con apariencia de IDE.
-   Tipografía legible y monoespaciada para SQL.
-   Colores de estado consistentes.
-   Diseño responsive.
-   Componentes reutilizables con Atomic Design.

### Pantalla de ejercicio

La pantalla de un ejercicio tendrá cuatro secciones:

1.  **Enunciado:** qué problema debe resolver el estudiante.
2.  **Esquema:** tablas disponibles y sus relaciones.
3.  **Editor:** espacio para escribir la consulta.
4.  **Resultados:** tabla de datos, validación y explicación.

Después de resolver el ejercicio, se mostrará una explicación del
concepto utilizado y, cuando sea útil, una solución alternativa.

------------------------------------------------------------------------

## 13. Plan de desarrollo

  -----------------------------------------------------------------------
  Etapa                               Entregables
  ----------------------------------- -----------------------------------
  1\. Fundamentos                     Arquitectura, repositorio, Docker,
                                      configuración, base principal,
                                      autenticación y CI.

  2\. Interfaz y aprendizaje          Dashboard, rutas, módulos,
                                      lecciones, componentes y
                                      navegación.

  3\. Motor SQL                       Monaco Editor, PostgreSQL aislado,
                                      sesiones, ejecución y manejo de
                                      errores.

  4\. Evaluación y ejercicios         Casos de prueba, validación
                                      semántica, pistas y primeros 50
                                      ejercicios.

  5\. Gamificación                    XP, insignias, niveles, progreso e
                                      historial.

  6\. Calidad y lanzamiento           Seguridad, rendimiento,
                                      accesibilidad, responsive y
                                      despliegue.
  -----------------------------------------------------------------------

### Hito funcional principal

La primera demostración completa debe permitir que:

1.  Un usuario cree su cuenta.
2.  Acceda al curso SQL Foundations.
3.  Abra su primer ejercicio.
4.  Visualice las tablas disponibles.
5.  Escriba una consulta en Monaco Editor.
6.  Ejecute la consulta sobre PostgreSQL aislado.
7.  Reciba el resultado y una evaluación.
8.  Gane experiencia y actualice su progreso.

Este flujo representa el núcleo funcional de SQL Academy.

------------------------------------------------------------------------

## 14. Criterios de calidad

El proyecto debe servir como ejemplo de buenas prácticas de ingeniería
de software.

### Desarrollo

-   TypeScript estricto.
-   Arquitectura modular y separación de responsabilidades.
-   Validación de entradas en frontend y backend.
-   Consultas parametrizadas para la aplicación.
-   Migraciones versionadas.
-   Pruebas unitarias, de integración y E2E.
-   Logs estructurados y auditoría.
-   Secretos mediante variables de entorno.
-   Documentación OpenAPI.
-   Revisión de dependencias y análisis estático.

### Operación y seguridad

-   Aislamiento del motor de ejecución.
-   Permisos mínimos.
-   Límites de CPU, memoria, tiempo y conexiones.
-   Cuotas de ejecución por usuario.
-   Copias de seguridad de la base principal.
-   Monitoreo de errores y disponibilidad.
-   Procedimientos de recuperación ante fallos.

------------------------------------------------------------------------

## 15. Documentación técnica que debe elaborarse

Antes de implementar funcionalidades extensas, se deben preparar tres
documentos:

### 15.1 Product Requirements Document (PRD)

Debe especificar:

-   Visión y objetivos del producto.
-   Usuarios y casos de uso.
-   Historias de usuario.
-   Requisitos funcionales.
-   Requisitos no funcionales.
-   Criterios de aceptación.
-   Alcance y exclusiones del MVP.
-   Métricas de éxito.

### 15.2 Software Architecture Document (SAD)

Debe especificar:

-   Arquitectura general.
-   Componentes y responsabilidades.
-   Límites entre módulos.
-   Comunicación entre frontend, API y SQL Runner.
-   Seguridad y aislamiento.
-   Infraestructura y despliegue.
-   Observabilidad.
-   Decisiones técnicas y sus justificaciones.

### 15.3 Database Design Document

Debe especificar:

-   Modelo entidad-relación.
-   Diccionario de datos.
-   Tipos de datos y restricciones.
-   Relaciones e índices.
-   Estrategia de migraciones.
-   Datos semilla.
-   Separación entre base de aplicación y entornos de práctica.

------------------------------------------------------------------------

## 16. Decisiones pendientes

Estas decisiones deben confirmarse antes de cerrar el diseño definitivo:

  Decisión               Propuesta inicial
  ---------------------- -----------------------------------------------
  Nombre                 SQL Academy, provisional
  Modelo de acceso       Gratuito inicialmente
  Panel administrativo   Sí, desde una etapa temprana
  Motor SQL              PostgreSQL
  Frontend               React + TypeScript
  Backend                Python + FastAPI
  Arquitectura           Monolito modular + SQL Runner independiente
  Diseño                 Dark mode principal y light mode alternativo
  Contenido inicial      Tres rutas completas y selección de la cuarta
  Ejercicios             50 retos para el MVP

------------------------------------------------------------------------

## 17. Principios del proyecto

1.  **Aprender haciendo:** el estudiante debe escribir y ejecutar SQL
    desde el principio.
2.  **Progresión real:** los retos deben aumentar en complejidad y
    reflejar habilidades laborales.
3.  **Retroalimentación útil:** explicar errores y conceptos, no
    limitarse a marcar respuestas incorrectas.
4.  **Seguridad por diseño:** las consultas de estudiantes nunca deben
    comprometer los datos de la aplicación ni de otros usuarios.
5.  **Calidad antes que cantidad:** es preferible publicar menos
    ejercicios bien evaluados que muchos ejercicios defectuosos.
6.  **Contenido mantenible:** cursos y ejercicios deben poder
    actualizarse sin modificar componentes de interfaz.
7.  **Arquitectura evolutiva:** comenzar con un MVP sencillo, modular y
    preparado para crecer.

------------------------------------------------------------------------

## 18. Próximo paso recomendado

Comenzar por la documentación formal del producto:

1.  Elaborar el PRD con historias de usuario y criterios de aceptación
    verificables.
2.  Elaborar el SAD con diagramas de componentes, despliegue, seguridad
    y flujos.
3.  Elaborar el diseño de base de datos con modelo ER, diccionario de
    datos y migraciones iniciales.
4.  Convertir los documentos en tareas de desarrollo priorizadas.
5.  Implementar el primer flujo funcional de extremo a extremo.

**Objetivo del MVP:** que cualquier usuario pueda registrarse, aprender
un concepto SQL, resolver un ejercicio ejecutable en PostgreSQL aislado
y recibir una evaluación útil de su solución.
