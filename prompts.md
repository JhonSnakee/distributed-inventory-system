# Prompts usados con GenAI durante el desarrollo

A continuación hay ejemplos de prompts que se pueden reutilizar para acelerar tareas similares.

1) Generar README inicial:
```
Eres un asistente que ayuda a escribir README para proyectos técnicos. Escribe un README conciso para un prototipo de sistema de inventario distribuido que use Node.js y SQLite.
```

2) Diseñar API REST:
```
Ayúdame a diseñar endpoints REST para un inventario con control de concurrencia optimista (version field), idempotencia y operaciones de ajuste/consulta.
```

3) Implementar código de ejemplo:
```
Genera un servicio Express con endpoints: GET /inventory/:sku, POST /inventory/:sku/adjust, PUT /inventory/:sku. Usa sqlite y protege operaciones con transacción y versión.
```

4) Escribir tests básicos (curl):
```
Genera ejemplos de curl para probar endpoints de inventario y demostrar manejo de conflictos de versión y reintentos idempotentes.
```

(Adapta y refina estos prompts según tu necesidad)


# Additional prompts
- Generated tests with Jest+Supertest
- Generated CI workflow for GitHub Actions
