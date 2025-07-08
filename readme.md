# next-edge-router

**An Express-like router tailored for next-generation serverless hosting, fully aligned with Next.js conventions.**

---

## ✨ Motivation

I recently moved away from a DevOps-heavy MERN stack in favor of a more serverless approach using Vercel, to reclaim more of my time and simplify deployment.

While I appreciate the simplicity of Express.js routers, I also enjoy the elegance of Next.js's file-based routing. I wanted something that gives me the best of both worlds—clean middleware-based routing like Express, while still embracing Next.js conventions and serverless architecture.

Thus, `next-edge-router` was born.

---

## 🚀 Solution

With `next-edge-router`, you can define your API routes under `/api` or `/v1` (or any Next.js-compatible route directory), then create middleware and handlers with a clean, chainable API.

### Example: `app/api/users/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import {
  createRouter,
  authenticationMiddleware,
  validationMiddleware,
} from "@/lib/router";

const router = createRouter();

// Global middleware
router.use(authenticationMiddleware);

// Handlers
const getUsers = async (req: NextRequest) => {
  return NextResponse.json({ users: ["user1", "user2"] });
};

const createUser = async (req: NextRequest) => {
  const body = await req.json();
  return NextResponse.json({ user: body, created: true }, { status: 201 });
};

// Route registration with optional per-route middleware
router.get(getUsers);
router.post(createUser, validationMiddleware({ required: ["name", "email"] }));

// Export route handlers for Next.js
export const { GET, POST } = router.export();
```
