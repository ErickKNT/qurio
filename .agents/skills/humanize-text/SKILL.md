---
name: humanize-text
description: >-
  Rewrites, drafts, or audits personal, technical, or UI text so it sounds naturally
  written by a person and avoids AI writing patterns cataloged in Wikipedia:Signs of AI writing.
  Use when the user asks to humanize text, remove AI tone, draft personal messages, emails,
  posts, or documentation without robotic phrasing.
---

# Humanize Text

Reescribe o redacta textos en español o inglés eliminando las muletillas, estructuras simétricas y tics de formato propios de modelos de lenguaje.

## Procedimiento

1. **Identifica el contexto real:** Determina quién habla, a quién le escribe y qué tono corresponde (mensaje personal, correo laboral, post, documentación técnica o copy de interfaz). Respeta la intención y los hechos del texto original sin inventar datos ni suavizar posturas.
2. **Audita contra la lista de señales:** Revisa el borrador buscando los patrones documentados en [wp-aisigns.md](./references/wp-aisigns.md). Presta especial atención a aperturas y cierres de plantilla, conectores formales repetidos, evitación de *ser/estar*, regla del tres, paralelismos negativos y listas con negrita y dos puntos.
3. **Reescribe con ritmo humano:**
   - Empieza directo por la idea principal.
   - Usa verbos simples y concretos (*es*, *tiene*, *falla*, *guarda*) en lugar de rodeos cultos.
   - Alterna oraciones cortas con otras más largas.
   - Convierte listas innecesarias en párrafos normales cuando no haga falta enumerar.
   - Elimina rayas (`—`) repetidas, emojis decorativos y capitalización *Title Case*.
4. **Verificación final:** Lee el resultado de corrido. Si alguna frase suena a comunicado corporativo, folleto o respuesta estándar de chatbot, reescribe esa frase antes de entregarla.

## Qué no hacer al entregar

- No agregues explicaciones previas ("Aquí tienes una versión más natural:") si el usuario solo pidió el texto reescrito.
- No cierres con preguntas de cortesía ni resúmenes optimistas.
