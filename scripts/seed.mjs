import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log("🌱 Cargando datos de ejemplo para FreshVida...");

// Insert clients
const clientsData = [
  { name: "Cooperativa Los Andes", email: "losandes@email.com", phone: "555-0101", city: "Medellín", address: "Cra 45 #12-30", active: true },
  { name: "Finca El Paraíso", email: "paraiso@email.com", phone: "555-0102", city: "Bogotá", address: "Km 5 vía norte", active: true },
  { name: "Distribuidora Verde", email: "verde@email.com", phone: "555-0103", city: "Cali", address: "Av 6N #23-45", active: true },
  { name: "Mercado Campesino", email: "campesino@email.com", phone: "555-0104", city: "Bucaramanga", address: "Calle 30 #15-20", active: true },
  { name: "Agroexport SA", email: "agroexport@email.com", phone: "555-0105", city: "Barranquilla", address: "Zona Industrial Lote 12", active: true },
  { name: "Hacienda San José", email: "sanjose@email.com", phone: "555-0106", city: "Manizales", address: "Vereda El Roble", active: true },
];

for (const c of clientsData) {
  try {
    await connection.execute(
      "INSERT INTO clients (name, email, phone, city, address) VALUES (?, ?, ?, ?, ?)",
      [c.name, c.email, c.phone, c.city, c.address]
    );
  } catch (e) { console.log('Client skip:', e.message); }
}
console.log("✅ Clientes insertados");

// Insert products
const productsData = [
  { name: "Tomate Chonto", category: "Hortalizas", description: "Tomate fresco de primera calidad", price: "3500.00", stock: 150, minStock: 20, unit: "kg", active: true },
  { name: "Lechuga Batavia", category: "Verduras", description: "Lechuga hidropónica fresca", price: "2800.00", stock: 80, minStock: 15, unit: "unidad", active: true },
  { name: "Zanahoria Baby", category: "Raices", description: "Zanahoria baby orgánica", price: "4200.00", stock: 120, minStock: 25, unit: "kg", active: true },
  { name: "Cilantro Fresco", category: "Hierbas", description: "Cilantro aromático de cultivo local", price: "1500.00", stock: 60, minStock: 10, unit: "manojo", active: true },
  { name: "Pimentón Rojo", category: "Hortalizas", description: "Pimentón rojo dulce", price: "5500.00", stock: 90, minStock: 20, unit: "kg", active: true },
  { name: "Espinaca Fresca", category: "Verduras", description: "Espinaca baby para ensaladas", price: "3200.00", stock: 45, minStock: 15, unit: "kg", active: true },
  { name: "Aguacate Hass", category: "Frutas", description: "Aguacate Hass de exportación", price: "8500.00", stock: 200, minStock: 30, unit: "kg", active: true },
  { name: "Maíz Dulce", category: "Granos", description: "Maíz dulce para consumo fresco", price: "2000.00", stock: 8, minStock: 20, unit: "kg", active: true },
];

for (const p of productsData) {
  try {
    await connection.execute(
      "INSERT IGNORE INTO products (name, category, description, price, stock, minStock, unit, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [p.name, p.category, p.description, p.price, p.stock, p.minStock, p.unit, p.active ? 1 : 0]
    );
  } catch (e) { /* skip */ }
}
console.log("✅ Productos insertados");

// Insert workshops
const workshopsData = [
  { title: "Agricultura Orgánica para Principiantes", description: "Aprende los fundamentos de la agricultura orgánica y cómo implementarla en tu finca.", instructor: "María García", date: new Date("2026-06-15T09:00:00"), duration: 240, location: "Centro Comunitario FreshVida", maxParticipants: 25, category: "Orgánico", active: true },
  { title: "Hidroponia en Casa", description: "Técnicas modernas de cultivo hidropónico para espacios pequeños.", instructor: "Carlos Rodríguez", date: new Date("2026-06-22T10:00:00"), duration: 180, location: "Laboratorio FreshVida", maxParticipants: 15, category: "Hidroponia", active: true },
  { title: "Compostaje y Abonos Orgánicos", description: "Elaboración de compost y biofertilizantes para mejorar la calidad del suelo.", instructor: "Ana López", date: new Date("2026-07-05T08:00:00"), duration: 300, location: "Finca Demostrativa", maxParticipants: 30, category: "Sostenibilidad", active: true },
  { title: "Gestión Empresarial para Agricultores", description: "Herramientas de gestión y finanzas para pequeños productores agrícolas.", instructor: "Pedro Martínez", date: new Date("2026-07-12T14:00:00"), duration: 120, location: "Sala de Capacitación", maxParticipants: 20, category: "Negocios", active: true },
  { title: "Control Biológico de Plagas", description: "Métodos naturales y sostenibles para el control de plagas en cultivos.", instructor: "Luis Pérez", date: new Date("2026-07-19T09:00:00"), duration: 180, location: "Laboratorio FreshVida", maxParticipants: 20, category: "Sostenibilidad", active: true },
];

for (const w of workshopsData) {
  try {
    await connection.execute(
      "INSERT IGNORE INTO workshops (title, description, instructor, date, duration, location, maxParticipants, category, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [w.title, w.description, w.instructor, w.date, w.duration, w.location, w.maxParticipants, w.category, w.active ? 1 : 0]
    );
  } catch (e) { /* skip */ }
}
console.log("✅ Talleres insertados");

// Get client and product IDs for orders
const [clientRows] = await connection.execute("SELECT id FROM clients LIMIT 4");
const [productRows] = await connection.execute("SELECT id, price FROM products LIMIT 5");

if (clientRows.length > 0 && productRows.length > 0) {
  const ordersData = [
    { clientIdx: 0, status: "delivered", items: [{ productIdx: 0, qty: 10 }, { productIdx: 1, qty: 5 }] },
    { clientIdx: 1, status: "delivered", items: [{ productIdx: 2, qty: 8 }, { productIdx: 3, qty: 12 }] },
    { clientIdx: 2, status: "processing", items: [{ productIdx: 4, qty: 6 }, { productIdx: 0, qty: 15 }] },
    { clientIdx: 3, status: "pending", items: [{ productIdx: 5, qty: 20 }] },
    { clientIdx: 0, status: "delivered", items: [{ productIdx: 6, qty: 25 }] },
    { clientIdx: 1, status: "cancelled", items: [{ productIdx: 7, qty: 50 }] },
  ];

  for (let i = 0; i < ordersData.length; i++) {
    const o = ordersData[i];
    const client = clientRows[o.clientIdx];
    const orderNumber = `FV-${Date.now()}-${i}`;
    let total = 0;
    const itemsWithPrices = o.items.map((item) => {
      const product = productRows[item.productIdx] || productRows[0];
      const price = parseFloat(product.price || "3000");
      total += price * item.qty;
      return { productId: product.id, qty: item.qty, price };
    });

    try {
      const [orderResult] = await connection.execute(
        "INSERT INTO orders (orderNumber, clientId, status, totalAmount, createdBy) VALUES (?, ?, ?, ?, 1)",
        [orderNumber, client.id, o.status, total.toFixed(2)]
      );
      const orderId = orderResult.insertId;
      for (const item of itemsWithPrices) {
        await connection.execute(
          "INSERT INTO orderItems (orderId, productId, quantity, unitPrice, subtotal) VALUES (?, ?, ?, ?, ?)",
          [orderId, item.productId, item.qty, item.price.toFixed(2), (item.price * item.qty).toFixed(2)]
        );
      }
    } catch (e) { /* skip */ }
  }
  console.log("✅ Pedidos insertados");
}

await connection.end();
console.log("🎉 Datos de ejemplo cargados exitosamente!");
