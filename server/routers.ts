import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  addInventoryMovement,
  createClient,
  createOrder,
  createProduct,
  createWorkshop,
  deleteClient,
  deleteOrder,
  deleteProduct,
  deleteWorkshop,
  deleteWorkshopParticipant,
  getClientById,
  getClients,
  getDashboardStats,
  getInventoryMovements,
  getLowStockProducts,
  getOrderById,
  getOrderWithItems,
  getOrders,
  getOrdersByClient,
  getProductById,
  getProducts,
  getWorkshopById,
  getWorkshopParticipants,
  getWorkshops,
  registerWorkshopParticipant,
  updateClient,
  updateOrderStatus,
  updateProduct,
  updateWorkshop,
  getAllUsers,
  setUserRole,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acceso solo para administradores" });
  }
  return next({ ctx });
});

// ─── Clients Router ───────────────────────────────────────────────────────────
const clientsRouter = router({
  list: protectedProcedure.query(async () => {
    return getClients();
  }),
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return getClientById(input.id);
  }),
  getOrders: protectedProcedure.input(z.object({ clientId: z.number() })).query(async ({ input }) => {
    return getOrdersByClient(input.clientId);
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createClient({
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        address: input.address || null,
        city: input.city || null,
        notes: input.notes || null,
      });
      return { success: true };
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateClient(id, data);
      return { success: true };
    }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteClient(input.id);
    return { success: true };
  }),
});

// ─── Products Router ──────────────────────────────────────────────────────────
const productsRouter = router({
  list: protectedProcedure.input(z.object({ includeInactive: z.boolean().optional() })).query(async ({ input }) => {
    return getProducts(input.includeInactive ?? false);
  }),
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return getProductById(input.id);
  }),
  lowStock: protectedProcedure.query(async () => {
    return getLowStockProducts();
  }),
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        description: z.string().optional(),
        price: z.string(),
        stock: z.number().int().min(0),
        minStock: z.number().int().min(0),
        unit: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createProduct({
        name: input.name,
        category: input.category,
        description: input.description || null,
        price: input.price,
        stock: input.stock,
        minStock: input.minStock,
        unit: input.unit || "kg",
        imageUrl: input.imageUrl || null,
        imageKey: input.imageKey || null,
        active: true,
      });
      return { success: true };
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        stock: z.number().int().min(0).optional(),
        minStock: z.number().int().min(0).optional(),
        unit: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateProduct(id, data);
      return { success: true };
    }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteProduct(input.id);
    return { success: true };
  }),
  uploadImage: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        base64: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const key = `products/${Date.now()}-${input.filename}`;
      const { url } = await storagePut(key, buffer, input.contentType);
      return { url, key };
    }),
});

// ─── Orders Router ────────────────────────────────────────────────────────────
const ordersRouter = router({
  list: protectedProcedure.input(z.object({ status: z.string().optional() }).optional()).query(async ({ input }) => {
    const db_orders = await getOrders();
    if (input?.status && input.status !== 'all') {
      return db_orders.filter((o) => o.status === input.status);
    }
    return db_orders;
  }),
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return getOrderById(input.id);
  }),
  getWithItems: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return getOrderWithItems(input.id);
  }),
  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        status: z.enum(["pending", "processing", "delivered", "cancelled"]).optional(),
        notes: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().int().min(1),
            unitPrice: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const orderNumber = `FV-${Date.now()}`;
      const totalAmount = input.items
        .reduce((sum, item) => sum + parseFloat(item.unitPrice) * item.quantity, 0)
        .toFixed(2);

      const orderItems = input.items.map((item) => ({
        orderId: 0,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
      }));

      const order = await createOrder(
        {
          orderNumber,
          clientId: input.clientId,
          status: input.status ?? "pending",
          totalAmount,
          notes: input.notes || null,
          createdBy: ctx.user.id,
        },
        orderItems
      );

      // Notify admin of new order
      try {
        await notifyOwner({
          title: "Nuevo pedido registrado",
          content: `Se ha registrado el pedido ${orderNumber} por $${totalAmount}`,
        });
      } catch (_) {}

      // Check for low stock after order
      const lowStock = await getLowStockProducts();
      if (lowStock.length > 0) {
        try {
          await notifyOwner({
            title: "Alerta de stock bajo",
            content: `Los siguientes productos tienen stock bajo: ${lowStock.map((p) => p.name).join(", ")}`,
          });
        } catch (_) {}
      }

      return { success: true, order };
    }),
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "processing", "delivered", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateOrderStatus(input.id, input.status);
      return { success: true };
    }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteOrder(input.id);
    return { success: true };
  }),
});

// ─── Inventory Router ─────────────────────────────────────────────────────────
const inventoryRouter = router({
  movements: protectedProcedure
    .input(z.object({ productId: z.number().optional() }))
    .query(async ({ input }) => {
      return getInventoryMovements(input.productId);
    }),
  addMovement: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        type: z.enum(["in", "out", "adjustment"]),
        quantity: z.number().int().min(1),
        reason: z.string().optional(),
        reference: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await addInventoryMovement({
        productId: input.productId,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason || null,
        reference: input.reference || null,
        createdBy: ctx.user.id,
      });

      // Check low stock after movement
      const lowStock = await getLowStockProducts();
      if (lowStock.length > 0) {
        try {
          await notifyOwner({
            title: "Alerta de stock bajo",
            content: `Productos con stock bajo: ${lowStock.map((p) => p.name).join(", ")}`,
          });
        } catch (_) {}
      }

      return { success: true };
    }),
});

// ─── Dashboard Router ─────────────────────────────────────────────────────────
const dashboardRouter = router({
  stats: protectedProcedure.query(async () => {
    return getDashboardStats();
  }),
});

// ─── Workshops Router ─────────────────────────────────────────────────────────
const workshopsRouter = router({
  list: publicProcedure.input(z.object({ activeOnly: z.boolean().optional() })).query(async ({ input, ctx }) => {
    const activeOnly = ctx.user ? (input.activeOnly ?? true) : true;
    return getWorkshops(activeOnly);
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return getWorkshopById(input.id);
  }),
  participants: protectedProcedure.input(z.object({ workshopId: z.number() })).query(async ({ input }) => {
    return getWorkshopParticipants(input.workshopId);
  }),
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        instructor: z.string().optional(),
        date: z.string(),
        duration: z.number().int().optional(),
        location: z.string().optional(),
        maxParticipants: z.number().int().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createWorkshop({
        title: input.title,
        description: input.description || null,
        instructor: input.instructor || null,
        date: new Date(input.date),
        duration: input.duration || null,
        location: input.location || null,
        maxParticipants: input.maxParticipants || 20,
        imageUrl: input.imageUrl || null,
        imageKey: input.imageKey || null,
        category: input.category || null,
        active: true,
      });
      return { success: true };
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        instructor: z.string().optional(),
        date: z.string().optional(),
        duration: z.number().int().optional(),
        location: z.string().optional(),
        maxParticipants: z.number().int().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        category: z.string().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, date, ...rest } = input;
      const data: Record<string, unknown> = { ...rest };
      if (date) data.date = new Date(date);
      await updateWorkshop(id, data as Parameters<typeof updateWorkshop>[1]);
      return { success: true };
    }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteWorkshop(input.id);
    return { success: true };
  }),
  registerParticipant: publicProcedure
    .input(
      z.object({
        workshopId: z.number(),
        name: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await registerWorkshopParticipant({
        workshopId: input.workshopId,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
      });
      return { success: true };
    }),
  removeParticipant: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteWorkshopParticipant(input.id);
    return { success: true };
  }),
  uploadImage: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        base64: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const key = `workshops/${Date.now()}-${input.filename}`;
      const { url } = await storagePut(key, buffer, input.contentType);
      return { url, key };
    }),
});

// ─── Seed Router (admin only) ─────────────────────────────────────────────
const seedRouter = router({
  run: adminProcedure.mutation(async ({ ctx }) => {
    const { getDb } = await import("./db");
    const schema = await import("../drizzle/schema");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const clientData = [
      { name: "Cooperativa Los Andes", email: "losandes@email.com", phone: "555-0101", city: "Medellin", address: "Cra 45 #12-30" },
      { name: "Finca El Paraiso", email: "paraiso@email.com", phone: "555-0102", city: "Bogota", address: "Km 5 via norte" },
      { name: "Distribuidora Verde", email: "verde@email.com", phone: "555-0103", city: "Cali", address: "Av 6N #23-45" },
      { name: "Mercado Campesino", email: "campesino@email.com", phone: "555-0104", city: "Bucaramanga", address: "Calle 30 #15-20" },
      { name: "Agroexport SA", email: "agroexport@email.com", phone: "555-0105", city: "Barranquilla", address: "Zona Industrial Lote 12" },
    ];
    for (const c of clientData) {
      await db.insert(schema.clients).values(c);
    }

    const productData = [
      { name: "Tomate Cherry", category: "Hortalizas", description: "Tomate cherry organico de primera calidad", price: "4500.00", stock: 150, minStock: 20, unit: "kg", active: true },
      { name: "Lechuga Hidroponica", category: "Verduras", description: "Lechuga cultivada en sistema hidroponico", price: "2800.00", stock: 80, minStock: 15, unit: "unidad", active: true },
      { name: "Zanahoria Organica", category: "Raices", description: "Zanahoria organica certificada", price: "3200.00", stock: 200, minStock: 30, unit: "kg", active: true },
      { name: "Espinaca Baby", category: "Verduras", description: "Espinaca baby para ensaladas", price: "5500.00", stock: 8, minStock: 20, unit: "kg", active: true },
      { name: "Pimenton Rojo", category: "Hortalizas", description: "Pimenton rojo premium", price: "6000.00", stock: 120, minStock: 25, unit: "kg", active: true },
      { name: "Cilantro Fresco", category: "Hierbas", description: "Cilantro fresco aromatico", price: "1500.00", stock: 5, minStock: 10, unit: "manojo", active: true },
      { name: "Aguacate Hass", category: "Frutas", description: "Aguacate Hass de exportacion", price: "8000.00", stock: 300, minStock: 50, unit: "kg", active: true },
      { name: "Fresa Organica", category: "Frutas", description: "Fresa organica del altiplano", price: "9500.00", stock: 60, minStock: 20, unit: "kg", active: true },
    ];
    for (const p of productData) {
      await db.insert(schema.products).values(p);
    }

    const workshopData = [
      { title: "Agricultura Organica Basica", description: "Aprende los fundamentos de la agricultura organica", instructor: "Maria Garcia", date: new Date("2025-06-15T09:00:00"), duration: 180, location: "Centro Comunitario FreshVida", maxParticipants: 25, category: "Organico", active: true },
      { title: "Hidroponia para Principiantes", description: "Introduccion al cultivo hidroponico sin suelo", instructor: "Carlos Rodriguez", date: new Date("2025-06-22T10:00:00"), duration: 240, location: "Invernadero FreshVida", maxParticipants: 15, category: "Hidroponia", active: true },
      { title: "Compostaje y Fertilizacion Natural", description: "Taller practico sobre elaboracion de compost", instructor: "Ana Martinez", date: new Date("2025-07-05T08:00:00"), duration: 150, location: "Campo Experimental", maxParticipants: 30, category: "Sostenibilidad", active: true },
      { title: "Control Biologico de Plagas", description: "Metodos naturales para el control de plagas", instructor: "Luis Perez", date: new Date("2025-07-19T09:00:00"), duration: 180, location: "Laboratorio FreshVida", maxParticipants: 20, category: "Sostenibilidad", active: true },
    ];
    for (const w of workshopData) {
      await db.insert(schema.workshops).values(w);
    }

    return { success: true, message: "Datos de ejemplo cargados correctamente" };
  }),
});
// ─── Users Router ──────────────────────────────────────────────────────────────
const usersRouter = router({
  list: adminProcedure.query(async () => {
    return getAllUsers();
  }),
  setRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      await setUserRole(input.userId, input.role);
      return { success: true };
    }),
});
// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  clients: clientsRouter,
  products: productsRouter,
  orders: ordersRouter,
  inventory: inventoryRouter,
  dashboard: dashboardRouter,
  workshops: workshopsRouter,
  users: usersRouter,
  seed: seedRouter,
});

export type AppRouter = typeof appRouter;
