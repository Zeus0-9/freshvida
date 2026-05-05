# FreshVida - TODO

## Fase 1: Base de datos y estructura
- [x] Schema Drizzle: tablas clients, products, orders, orderItems, inventory, inventoryMovements, workshops, workshopParticipants
- [x] Migración SQL aplicada a la base de datos
- [x] Helpers de DB en server/db.ts

## Fase 2: Backend (tRPC routers)
- [x] Router de clientes (CRUD completo)
- [x] Router de productos (CRUD + subida de imágenes)
- [x] Router de pedidos (CRUD + cambio de estado)
- [x] Router de inventario (stock, movimientos, alertas)
- [x] Router de talleres (CRUD + participantes)
- [x] Router de dashboard (KPIs, gráficos)
- [x] Router de facturas (generación de datos)
- [x] Alertas automáticas al admin (stock bajo, nuevo pedido)
- [x] Router de usuarios (lista, cambio de rol)

## Fase 3: Layout y diseño visual
- [x] Tema verde agrícola en index.css (paleta OKLCH)
- [x] DashboardLayout con sidebar de navegación completo
- [x] Tipografía moderna (Inter/Plus Jakarta Sans)
- [x] Identidad visual FreshVida (logo, colores)
- [x] Rutas en App.tsx para todos los módulos

## Fase 4: Dashboard
- [x] KPIs: ventas totales, ingresos, clientes, pedidos pendientes
- [x] Gráfico de ventas por período (LineChart/AreaChart)
- [x] Gráfico de productos más vendidos (BarChart)
- [x] Gráfico de ingresos (PieChart/composición)
- [x] Tabla de pedidos recientes

## Fase 5: Módulos CRUD
- [x] Página de Clientes (lista, crear, editar, eliminar, historial)
- [x] Página de Productos (lista, crear, editar, eliminar, subida de imagen)
- [x] Página de Pedidos (lista, crear, editar estado, ver detalle)

## Fase 6: Inventario
- [x] Página de Inventario con tabla de stock
- [x] Alertas visuales de bajo stock
- [x] Registro de movimientos (entrada/salida)
- [x] Configuración de stock mínimo por producto

## Fase 7: Facturas y Talleres
- [x] Página de generación de facturas por pedido
- [x] Vista de impresión/PDF de factura con datos FreshVida
- [x] Página de Talleres (lista pública y gestión admin)
- [x] Detalle de taller con registro de participantes
- [x] CRUD de talleres para admin

## Fase 8: Datos de ejemplo y pruebas
- [x] Seed de datos de ejemplo (6 clientes, 16 productos, 6 pedidos, 10 talleres)
- [x] Tests Vitest para routers principales (8 tests pasando)
- [x] Revisión de diseño y responsive
- [x] Control de acceso RBAC verificado en todos los módulos

## Fase 9: Configuración
- [x] Página de Configuración con perfil, gestión de usuarios y permisos

## MEJORAS PROFESIONALES - Fase 10: Página de inicio

- [x] Landing page profesional con hero section
- [x] Eslogan y misión de FreshVida
- [x] Botones: Iniciar sesión, Ver misión, Ver productos
- [x] Sección de características principales
- [x] Sección de testimonios (opcional)
- [x] Footer con información de contacto

## Mejoras Profesionales - Fase 11: Dashboard mejorado

- [x] Resumen financiero: ingresos, gastos, ganancias
- [x] Gráfico de ventas por mes (últimos 6 meses)
- [x] Gráfico de productos más vendidos (top 5)
- [x] Alertas de inventario bajo destacadas
- [x] Actividad reciente (últimas transacciones)
- [x] Acciones rápidas: agregar cliente, producto, pedido, factura
- [x] Resumen de impacto social en dashboard

## Mejoras Profesionales - Fase 12: Módulo de Ingresos y Gastos

- [x] Tabla de ingresos (pedidos completados)
- [x] Tabla de gastos (registros manuales)
- [x] Crear gasto manual
- [x] Editar/eliminar gasto
- [x] Filtrar por fecha y tipo
- [x] Resumen de ingresos vs gastos

## Mejoras Profesionales - Fase 13: Sección de Impacto Social

- [x] Tabla de comunidades beneficiadas
- [x] Métricas: personas capacitadas, talleres realizados, recursos distribuidos
- [x] Crear/editar comunidad
- [x] Registrar impacto por taller
- [x] Gráficos de impacto acumulado
- [x] Reporte de impacto social

## Mejoras Profesionales - Fase 14: Sección de Reportes

- [x] Reporte mensual con resumen financiero
- [x] Total de ventas, gastos, ganancia neta
- [x] Productos más vendidos
- [x] Clientes activos
- [x] Impacto social del mes
- [x] Exportar reporte a PDF

## Mejoras Profesionales - Fase 15: Diseño visual profesional

- [x] Mejorar colores: verde agrícola, blanco, detalles oscuros
- [x] Iconos profesionales en todos los módulos
- [x] Tarjetas elegantes y consistentes
- [x] Sidebar moderno con animaciones
- [x] Diseño responsive para móvil y tablet
- [x] Transiciones suaves y micro-interacciones

## Mejoras Profesionales - Fase 16: Datos de ejemplo realistas

- [x] Expandir seed: 20+ clientes, 50+ productos, 100+ pedidos
- [x] Datos de gastos realistas
- [x] Datos de impacto social completos
- [x] Histórico de 6 meses de datos

## Mejoras Profesionales - Fase 17: Testing y pulido final

- [x] Tests adicionales para nuevos módulos
- [x] Verificar responsividad en móvil
- [x] Optimizar performance
- [x] Revisar accesibilidad
- [x] Checkpoint final

## Bug Fixes
- [x] Fix: Landing.tsx calling navigate() during render phase causing "Cannot update a component while rendering" error
