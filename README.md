# Distributed Inventory Management System — Prototype

Resumen rápido
--------------
Este repositorio contiene una **propuesta técnica** y una **implementación prototipo** (simplificada) de un sistema de gestión de inventario distribuido pensado para minimizar inconsistencias, reducir latencia en actualizaciones y mejorar observabilidad y tolerancia a fallos.

Contenido principal
-------------------
- `src/` - servidor backend prototipo (Node.js + Express) usando SQLite (archivo) como persistencia simulada.
- `run.md` - instrucciones para ejecutar el prototipo localmente.
- `prompts.md` - prompts de GenAI que se usaron durante el desarrollo (si aplica).
- `project-plan.md` - plan corto del proyecto, decisiones arquitectónicas y hitos.
- `zip` - carpeta donde se genera el zip final (automáticamente durante la entrega).

Arquitectura propuesta (resumen)
--------------------------------
1. **Modelo**: CQRS + Event Sourcing conceptual.
   - Escrituras (commands) van a un servicio de *command* que valida y emite eventos de inventario al *event bus* (p. ej. Kafka / Amazon MSK / AWS Kinesis).
   - Lecturas (queries) son servidas desde réplicas optimizadas (read-models) en cachés distribuidas (p. ej. Redis) por tienda y para la vista global.
2. **Consistencia**: Se propone **consistencia fuerte para operaciones de stock crítico** (compra, reserva) usando control de concurrencia optimista (version/cas) y confirmación central (coordinator). Para operaciones no críticas (reportes) se permite consistencia eventual.
3. **Sincronización**: sincronización push desde tiendas hacia el command service con idempotencia y reconciliación periódica en background (compaction / reconciliation).
4. **Observabilidad**: trazabilidad de eventos, métricas (Prometheus), logs estructurados y trazas (OpenTelemetry).
5. **Seguridad**: TLS, autenticación basada en JWT, autorización por roles, y cabeceras idempotency-key para idempotencia segura.

Prototipo
---------
El prototipo implementa:
- API REST con endpoints para consultar inventario, ajustar stock y reconciliar/empujar cambios.
- Persistencia simulada con SQLite (archivo `data/inventory.db`).
- Mecanismo de control de concurrencia optimista (campo `version`) para evitar sobrescrituras no intencionadas.
- Idempotencia y reintento básico por `Idempotency-Key` header.
- Manejo básico de errores y logs.

Lee `run.md` para instrucciones rápidas de ejecución y pruebas.
