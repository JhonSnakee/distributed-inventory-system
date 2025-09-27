# Cómo ejecutar el prototipo (local)

Requisitos
---------
- Node.js 18+ y npm (o pnpm/yarn)
- Git (opcional)

Instalación
-----------
```bash
git clone <this-repo> inventory-prototype
cd inventory-prototype
npm install
```

Inicializar la DB y datos de ejemplo
-----------------------------------
```bash
# crea la carpeta data si no existe y arranca el servidor (el servidor inicializa la DB automáticamente)
npm start
```

Comandos útiles (curl)
----------------------
1. Consultar inventario global por SKU:
```bash
curl -s http://localhost:3000/inventory/sku-123 | jq .
```
o
```bash
curl http://localhost:3000/inventory/sku-123 | ConvertFrom-Json
```

2. Ajustar stock (reducción por venta) con control de versión y idempotencia:
```bash
curl -X POST http://localhost:3000/inventory/sku-123/adjust \
  -H "Content-Type: application/json" \
  -H "X-Store-Id: store-1" \
  -H "Idempotency-Key: my-op-123" \
  -d '{"delta": -2, "expectedVersion": 5}'
```

3. Crear/Actualizar stock (set):
```bash
curl -X PUT http://localhost:3000/inventory/sku-123 \
  -H "Content-Type: application/json" \
  -H "X-Store-Id: store-1" \
  -d '{"quantity": 10}'
```

Notas
-----
- Este prototipo es deliberadamente sencillo: la intención es demostrar las decisiones arquitectónicas y los mecanismos clave (optimistic locking, idempotency, transacciones locales).
- Para producción se recomienda: migrar event bus a Kafka/Kinesis, usar Redis para caché de lectura, añadir TLS/JWT, y desplegar servicios en contenedores + autoescalado.
