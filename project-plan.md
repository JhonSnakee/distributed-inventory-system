# Project Plan — Improvement for Distributed Inventory Management System

Objetivo: reducir inconsistencias de stock en el canal online y disminuir latencia de actualización desde tiendas.

Alcance mínimo viable (MVP)
- API centralizada para recibir y validar cambios desde tiendas.
- Persistencia de eventos y read-model simple (SQLite).
- Control de concurrencia optimista con version/cas.
- Endpoints públicos para consulta y ajuste de stock.
- Reconciliación batch y endpoint para push manual.

Hitos (2 semanas)
1. Día 0-2: Diseño de arquitectura y API (documentación).
2. Día 3-7: Implementación del prototipo (endpoints principales, db init, scripts de prueba).
3. Día 8-10: Pruebas de concurrencia (simular múltiples stores), ajustes y documentación.
4. Día 11-14: Observabilidad mínima (logs estructurados) y preparación del entregable (zip + README + run.md).

Decisiones técnicas clave
- **Stack**: Node.js + Express (rápido para prototipos), SQLite para persistencia local.
- **Consistencia**: Optimistic locking para operaciones de stock crítico; centralización de validación en command service.
- **Escalado**: Desacoplar lectura/escritura con CQRS y usar Redis para read-models en producción.
- **Event Bus**: Kafka o Kinesis; para prototipo se usa un modelo síncrono / local.
