import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Client,
  InsertClient,
  InsertInventoryMovement,
  InsertOrder,
  InsertOrderItem,
  InsertProduct,
  InsertUser,
  InsertWorkshop,
  InsertWorkshopParticipant,
  clients,
  inventoryMovements,
  orderItems,
  orders,
  products,
  users,
  workshopParticipants,
  workshops,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
import { ENV } from "./_core/env";

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Clients ──────────────────────────────────────────────────────────────────
export async function getClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(clients).values(data);
  return result;
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.delete(clients).where(eq(clients.id, id));
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getProducts(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(products).orderBy(desc(products.createdAt));
  if (!includeInactive) {
    return db.select().from(products).where(eq(products.active, true)).orderBy(desc(products.createdAt));
  }
  return query;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getLowStockProducts() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(and(eq(products.active, true), lt(products.stock, products.minStock)));
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(products).values(data);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(products).set({ active: false }).where(eq(products.id, id));
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getOrders() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      clientId: orders.clientId,
      clientName: clients.name,
      status: orders.status,
      totalAmount: orders.totalAmount,
      notes: orders.notes,
      createdBy: orders.createdBy,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderWithItems(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order[0]) return null;
  const items = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      subtotal: orderItems.subtotal,
      productName: products.name,
      productUnit: products.unit,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));
  const client = await db.select().from(clients).where(eq(clients.id, order[0].clientId)).limit(1);
  return { order: order[0], items, client: client[0] };
}

export async function getOrdersByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.clientId, clientId)).orderBy(desc(orders.createdAt));
}

export async function createOrder(data: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(orders).values(data);
  const created = await db.select().from(orders).where(eq(orders.orderNumber, data.orderNumber)).limit(1);
  if (created[0] && items.length > 0) {
    const itemsWithOrderId = items.map((item) => ({ ...item, orderId: created[0].id }));
    await db.insert(orderItems).values(itemsWithOrderId);
    // Reduce stock
    for (const item of items) {
      await db
        .update(products)
        .set({ stock: sql`stock - ${item.quantity}` })
        .where(eq(products.id, item.productId));
      await db.insert(inventoryMovements).values({
        productId: item.productId,
        type: "out",
        quantity: item.quantity,
        reason: "Pedido #" + data.orderNumber,
        reference: data.orderNumber,
        createdBy: data.createdBy ?? null,
      });
    }
  }
  return created[0];
}

export async function updateOrderStatus(id: number, status: "pending" | "processing" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(orderItems).where(eq(orderItems.orderId, id));
  return db.delete(orders).where(eq(orders.id, id));
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export async function getInventoryMovements(productId?: number) {
  const db = await getDb();
  if (!db) return [];
  const baseQuery = db
    .select({
      id: inventoryMovements.id,
      productId: inventoryMovements.productId,
      productName: products.name,
      type: inventoryMovements.type,
      quantity: inventoryMovements.quantity,
      reason: inventoryMovements.reason,
      reference: inventoryMovements.reference,
      createdBy: inventoryMovements.createdBy,
      createdAt: inventoryMovements.createdAt,
    })
    .from(inventoryMovements)
    .leftJoin(products, eq(inventoryMovements.productId, products.id))
    .orderBy(desc(inventoryMovements.createdAt));
  if (productId) {
    return baseQuery.where(eq(inventoryMovements.productId, productId));
  }
  return baseQuery.limit(100);
}

export async function addInventoryMovement(data: InsertInventoryMovement) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(inventoryMovements).values(data);
  if (data.type === "in") {
    await db
      .update(products)
      .set({ stock: sql`stock + ${data.quantity}` })
      .where(eq(products.id, data.productId));
  } else if (data.type === "out") {
    await db
      .update(products)
      .set({ stock: sql`stock - ${data.quantity}` })
      .where(eq(products.id, data.productId));
  } else if (data.type === "adjustment") {
    await db
      .update(products)
      .set({ stock: data.quantity })
      .where(eq(products.id, data.productId));
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const [totalClients] = await db.select({ count: sql<number>`count(*)` }).from(clients);
  const [totalProducts] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.active, true));
  const [totalOrders] = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const [pendingOrders] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending"));
  const [totalRevenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
    .from(orders)
    .where(eq(orders.status, "delivered"));

  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      clientName: clients.name,
    })
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  const lowStock = await getLowStockProducts();

  // Sales by month (last 6 months)
  const salesByMonth = await db
    .select({
      month: sql<string>`DATE_FORMAT(createdAt, '%Y-%m')`,
      total: sql<number>`COALESCE(SUM(totalAmount), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(
      eq(orders.status, "delivered"),
      gte(orders.createdAt, sql`DATE_SUB(NOW(), INTERVAL 6 MONTH)`)
    ))
    .groupBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`);

  // Top products by sales
  const topProducts = await db
    .select({
      productId: orderItems.productId,
      productName: products.name,
      totalQty: sql<number>`SUM(orderItems.quantity)`,
      totalRevenue: sql<number>`SUM(orderItems.subtotal)`,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .groupBy(orderItems.productId, products.name)
    .orderBy(sql`SUM(orderItems.quantity) DESC`)
    .limit(5);

  return {
    totalClients: Number(totalClients?.count ?? 0),
    totalProducts: Number(totalProducts?.count ?? 0),
    totalOrders: Number(totalOrders?.count ?? 0),
    pendingOrders: Number(pendingOrders?.count ?? 0),
    totalRevenue: Number(totalRevenue?.total ?? 0),
    recentOrders,
    lowStock,
    salesByMonth,
    topProducts,
  };
}

// ─── Workshops ────────────────────────────────────────────────────────────────
export async function getWorkshops(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(workshops).where(eq(workshops.active, true)).orderBy(workshops.date);
  }
  return db.select().from(workshops).orderBy(workshops.date);
}

export async function getWorkshopById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(workshops).where(eq(workshops.id, id)).limit(1);
  return result[0];
}

export async function createWorkshop(data: InsertWorkshop) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(workshops).values(data);
}

export async function updateWorkshop(id: number, data: Partial<InsertWorkshop>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(workshops).set(data).where(eq(workshops.id, id));
}

export async function deleteWorkshop(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(workshops).set({ active: false }).where(eq(workshops.id, id));
}

export async function getWorkshopParticipants(workshopId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(workshopParticipants)
    .where(eq(workshopParticipants.workshopId, workshopId))
    .orderBy(desc(workshopParticipants.registeredAt));
}

export async function registerWorkshopParticipant(data: InsertWorkshopParticipant) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(workshopParticipants).values(data);
}

export async function deleteWorkshopParticipant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.delete(workshopParticipants).where(eq(workshopParticipants.id, id));
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(users.createdAt);
}

export async function setUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}
