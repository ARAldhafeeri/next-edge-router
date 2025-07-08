import { NextRequest, NextResponse } from "next/server";
import { Router, createRouter, Handler, Middleware } from "../src/router";

// Mock Next.js components
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Map(),
    })),
  },
}));

describe("Router", () => {
  let router: Router;
  let mockRequest: NextRequest;

  beforeEach(() => {
    router = createRouter();
    mockRequest = {
      method: "GET",
      url: "http://localhost:3000/api/test",
      headers: new Map(),
    } as unknown as NextRequest;
  });

  describe("Basic HTTP Methods", () => {
    it("should register and handle GET requests", async () => {
      const handler: Handler = async () => {
        return NextResponse.json({ message: "GET success" });
      };

      router.get(handler);
      const getHandler = router.getHandler("GET");

      const response = await getHandler(mockRequest);
      expect(response).toBeDefined();
    });

    it("should register and handle POST requests", async () => {
      const handler: Handler = async () => {
        return NextResponse.json({ message: "POST success" });
      };

      router.post(handler);
      const postHandler = router.getHandler("POST");

      const response = await postHandler(mockRequest);
      expect(response).toBeDefined();
    });

    it("should register and handle PUT requests", async () => {
      const handler: Handler = async () => {
        return NextResponse.json({ message: "PUT success" });
      };

      router.put(handler);
      const putHandler = router.getHandler("PUT");

      const response = await putHandler(mockRequest);
      expect(response).toBeDefined();
    });

    it("should register and handle DELETE requests", async () => {
      const handler: Handler = async () => {
        return NextResponse.json({ message: "DELETE success" });
      };

      router.delete(handler);
      const deleteHandler = router.getHandler("DELETE");

      const response = await deleteHandler(mockRequest);
      expect(response).toBeDefined();
    });

    it("should register and handle PATCH requests", async () => {
      const handler: Handler = async () => {
        return NextResponse.json({ message: "PATCH success" });
      };

      router.patch(handler);
      const patchHandler = router.getHandler("PATCH");

      const response = await patchHandler(mockRequest);
      expect(response).toBeDefined();
    });

    it("should register and handle OPTIONS requests", async () => {
      const handler: Handler = async () => {
        return NextResponse.json({ message: "OPTIONS success" });
      };

      router.options(handler);
      const optionsHandler = router.getHandler("OPTIONS");

      const response = await optionsHandler(mockRequest);
      expect(response).toBeDefined();
    });

    it("should register and handle HEAD requests", async () => {
      const handler: Handler = async (_req) => {
        return NextResponse.json({ message: "HEAD success" });
      };

      router.head(handler);
      const headHandler = router.getHandler("HEAD");

      const response = await headHandler(mockRequest);
      expect(response).toBeDefined();
    });
  });

  describe("Method Not Allowed", () => {
    it("should return 405 for unregistered methods", async () => {
      const getHandler = router.getHandler("GET");

      const response = await getHandler(mockRequest);
      expect(response.status).toBe(405);
    });
  });

  describe("Middleware Support", () => {
    it("should execute route-specific middleware", async () => {
      const middlewareOrder: string[] = [];

      const middleware1: Middleware = async (_req, next) => {
        middlewareOrder.push("middleware1");
        return next();
      };

      const middleware2: Middleware = async (_req, next) => {
        middlewareOrder.push("middleware2");
        return next();
      };

      const handler: Handler = async (_req) => {
        middlewareOrder.push("handler");
        return NextResponse.json({ success: true });
      };

      router.get(handler, middleware1, middleware2);
      const getHandler = router.getHandler("GET");

      await getHandler(mockRequest);

      expect(middlewareOrder).toEqual([
        "middleware1",
        "middleware2",
        "handler",
      ]);
    });

    it("should execute router-level middleware before route-specific middleware", async () => {
      const middlewareOrder: string[] = [];

      const routerMiddleware: Middleware = async (_req, next) => {
        middlewareOrder.push("router-middleware");
        return next();
      };

      const routeMiddleware: Middleware = async (_req, next) => {
        middlewareOrder.push("route-middleware");
        return next();
      };

      const handler: Handler = async (_req) => {
        middlewareOrder.push("handler");
        return NextResponse.json({ success: true });
      };

      router.use(routerMiddleware);
      router.get(handler, routeMiddleware);
      const getHandler = router.getHandler("GET");

      await getHandler(mockRequest);

      expect(middlewareOrder).toEqual([
        "router-middleware",
        "route-middleware",
        "handler",
      ]);
    });

    it("should allow middleware to modify request", async () => {
      const middleware: Middleware = async (_req, next) => {
        // In a real scenario, you might modify req object
        // For testing, we'll just verify the middleware was called
        return next();
      };

      const handler: Handler = async (_req) => {
        return NextResponse.json({ success: true });
      };

      router.get(handler, middleware);
      const getHandler = router.getHandler("GET");

      const response = await getHandler(mockRequest);
      expect(response).toBeDefined();
    });

    it("should allow middleware to short-circuit the request", async () => {
      const middleware: Middleware = async (_req, _next) => {
        // This middleware doesn't call next(), so it short-circuits
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      };

      const handler: Handler = async (_req) => {
        // This should never be called
        return NextResponse.json({ success: true });
      };

      router.get(handler, middleware);
      const getHandler = router.getHandler("GET");

      const response = await getHandler(mockRequest);
      expect(response.status).toBe(401);
    });
  });

  describe("Export functionality", () => {
    it("should export only registered methods", () => {
      const handler: Handler = async (_req) => {
        return NextResponse.json({ success: true });
      };

      router.get(handler);
      router.post(handler);

      const exports = router.export();

      expect(exports.GET).toBeDefined();
      expect(exports.POST).toBeDefined();
      expect(exports.PUT).toBeUndefined();
      expect(exports.DELETE).toBeUndefined();
    });

    it("should create new router instance with createRouter", () => {
      const router1 = createRouter();
      const router2 = createRouter();

      expect(router1).toBeInstanceOf(Router);
      expect(router2).toBeInstanceOf(Router);
      expect(router1).not.toBe(router2);
    });
  });

  describe("Chaining", () => {
    it("should support method chaining", () => {
      const handler: Handler = async (_req) => {
        return NextResponse.json({ success: true });
      };

      const middleware: Middleware = async (_req, next) => {
        return next();
      };

      const result = router.use(middleware).get(handler).post(handler);

      expect(result).toBeInstanceOf(Router);
    });
  });
});
