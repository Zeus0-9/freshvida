import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@freshvida.co",
    name: "Admin FreshVida",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createEmployeeContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "employee-user",
    email: "empleado@freshvida.co",
    name: "Empleado FreshVida",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("auth", () => {
  it("returns null user for unauthenticated request", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("returns user info for authenticated request", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).not.toBeNull();
    expect(user?.role).toBe("admin");
    expect(user?.email).toBe("admin@freshvida.co");
  });

  it("clears session cookie on logout", async () => {
    const clearedCookies: string[] = [];
    const ctx = createAdminContext();
    ctx.res.clearCookie = (name: string) => { clearedCookies.push(name); };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBe(1);
  });
});

describe("RBAC - admin procedures", () => {
  it("throws FORBIDDEN when employee tries to access admin-only inventory mutation", async () => {
    const ctx = createEmployeeContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.inventory.addMovement({ productId: 1, type: "in", quantity: 10 })
    ).rejects.toThrow();
  });

  it("throws FORBIDDEN when employee tries to access users list", async () => {
    const ctx = createEmployeeContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.users.list()).rejects.toThrow();
  });
});

describe("dashboard stats", () => {
  it("returns dashboard stats for authenticated user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.dashboard.stats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalClients).toBe("number");
    expect(typeof stats.totalProducts).toBe("number");
    expect(typeof stats.totalOrders).toBe("number");
  });
});

describe("workshops public access", () => {
  it("returns workshops list for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const workshops = await caller.workshops.list({ activeOnly: true });
    expect(Array.isArray(workshops)).toBe(true);
  });
});
